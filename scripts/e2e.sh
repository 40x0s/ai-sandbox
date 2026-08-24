#!/usr/bin/env bash
# End-to-end smoke test against a running dev server on :3000.
set -u
B=http://localhost:3000
cd "$(dirname "$0")/.."
rm -f /tmp/*.jar /tmp/*.json

pass=0; fail=0
dbq() { npx tsx scripts/db-query.mts "$1" 2>/dev/null; }

check() { # check <label> <expected> <actual>
  if [ "$2" = "$3" ]; then printf "  PASS  %-46s %s\n" "$1" "$3"; pass=$((pass+1))
  else printf "  FAIL  %-46s expected=%s actual=%s\n" "$1" "$2" "$3"; fail=$((fail+1)); fi
}

CATID=$(dbq 'SELECT id FROM "Category" WHERE slug=$$women$$')
TEEPID=$(dbq 'SELECT id FROM "Product" WHERE slug=$$essential-cotton-tee$$')
STOCK_BEFORE=$(dbq 'SELECT stock FROM "Product" WHERE slug=$$essential-cotton-tee$$')

echo "=== AUTH GUARDS ==="
check "GET /admin unauthenticated -> 307" "307" "$(curl -s -o /dev/null -w '%{http_code}' $B/admin)"
check "POST /api/admin/products unauthenticated -> 401" "401" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/admin/products -H 'Content-Type: application/json' -d '{"name":"x"}')"
check "GET /checkout/success without id -> 404" "404" "$(curl -s -o /dev/null -w '%{http_code}' $B/checkout/success)"

echo "=== AUTH ==="
CODE=$(curl -s -c /tmp/admin.jar -o /tmp/login.json -w '%{http_code}' -X POST $B/api/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"admin@store.test","password":"admin123"}')
check "admin login -> 200" "200" "$CODE"
check "session cookie issued" "true" \
  "$(grep -q atelier_session /tmp/admin.jar && echo true || echo false)"
check "wrong password -> 401" "401" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@store.test","password":"wrong"}')"

EMAIL="buyer$(date +%s)@store.test"
CODE=$(curl -s -c /tmp/buyer.jar -o /tmp/reg.json -w '%{http_code}' -X POST $B/api/auth/register \
  -H 'Content-Type: application/json' -d "{\"name\":\"E2E Buyer\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
check "register new customer -> 201" "201" "$CODE"
check "register short password -> 422" "422" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Bad","email":"bad@store.test","password":"x"}')"

echo "=== ADMIN: CREATE ==="
cat > /tmp/new.json <<JSON
{"name":"E2E Silk Scarf","slug":"e2e-silk-scarf",
 "description":"A hand-rolled silk scarf created by the automated end-to-end test run.",
 "price":49.5,"compareAtPrice":"","imageUrl":"/images/products/floral-dress.jpg",
 "stock":12,"featured":false,"categoryId":"$CATID","sizeLabels":["S"],"colorSlugs":["navy","cream"]}
JSON
CODE=$(curl -s -b /tmp/admin.jar -o /tmp/created.json -w '%{http_code}' -X POST $B/api/admin/products \
  -H 'Content-Type: application/json' --data @/tmp/new.json)
check "create product -> 201" "201" "$CODE"
NEWID=$(node -e "try{process.stdout.write(require('/tmp/created.json').product.id)}catch{}" 2>/dev/null)
check "price stored as integer cents (4950)" "4950" \
  "$(node -e "try{process.stdout.write(String(require('/tmp/created.json').product.price))}catch{}" 2>/dev/null)"
check "duplicate slug -> 409" "409" \
  "$(curl -s -b /tmp/admin.jar -o /dev/null -w '%{http_code}' -X POST $B/api/admin/products -H 'Content-Type: application/json' --data @/tmp/new.json)"
check "invalid category id -> 422 (not 500)" "422" \
  "$(curl -s -b /tmp/admin.jar -o /dev/null -w '%{http_code}' -X POST $B/api/admin/products -H 'Content-Type: application/json' \
     -d '{"name":"Bad Cat","slug":"bad-cat","description":"invalid category reference check","price":10,"imageUrl":"/x.jpg","stock":1,"categoryId":"nope","sizeLabels":[],"colorSlugs":[]}')"

echo "=== ADMIN: UPDATE / DELETE ==="
sed -i 's/"stock":12/"stock":7/; s/E2E Silk Scarf/E2E Silk Scarf v2/' /tmp/new.json
CODE=$(curl -s -b /tmp/admin.jar -o /tmp/patched.json -w '%{http_code}' -X PATCH "$B/api/admin/products/$NEWID" \
  -H 'Content-Type: application/json' --data @/tmp/new.json)
check "update product -> 200" "200" "$CODE"
check "updated stock is 7" "7" "$(node -e "try{process.stdout.write(String(require('/tmp/patched.json').product.stock))}catch{}" 2>/dev/null)"

echo "=== STOREFRONT RENDERS NEW PRODUCT ==="
check "GET /products/e2e-silk-scarf -> 200" "200" "$(curl -s -o /tmp/pdp.html -w '%{http_code}' $B/products/e2e-silk-scarf)"
check "PDP shows updated name" "true" "$(grep -qF 'E2E Silk Scarf v2' /tmp/pdp.html && echo true || echo false)"
curl -s "$B/catalog?category=women" -o /tmp/cat.html
check "catalog lists new product" "true" "$(grep -qF 'E2E Silk Scarf v2' /tmp/cat.html && echo true || echo false)"

echo "=== CATALOG FILTERS ==="
for q in "category=kids:Little Explorer Hoodie" "size=XL:Essential Heavyweight Tee" "sale=1:Heritage Denim Jacket" "min=100:Cable Knit Wool Sweater"; do
  url="${q%%:*}"; needle="${q#*:}"
  curl -s "$B/catalog?$url" -o /tmp/f.html
  check "?$url contains '$needle'" "true" "$(grep -qF "$needle" /tmp/f.html && echo true || echo false)"
done
curl -s "$B/catalog?min=100" -o /tmp/f2.html
check "?min=100 excludes the \$32 tee" "false" "$(grep -qF 'Essential Heavyweight Tee' /tmp/f2.html && echo true || echo false)"
curl -s "$B/catalog?category=kids&size=XL" -o /tmp/f3.html
check "?category=kids&size=XL -> empty state" "true" "$(grep -qF 'No products match those filters' /tmp/f3.html && echo true || echo false)"

echo "=== CHECKOUT ==="
ORDERS_BEFORE=$(dbq 'SELECT count(*) FROM "Order"')
ITEMS_BEFORE=$(dbq 'SELECT count(*) FROM "OrderItem"')
cat > /tmp/order.json <<JSON
{"email":"$EMAIL","fullName":"E2E Buyer","address":"12 Test Street","city":"Riyadh",
 "postcode":"12345","country":"Saudi Arabia",
 "lines":[{"productId":"$TEEPID","size":"M","color":"White","quantity":2}]}
JSON
CODE=$(curl -s -b /tmp/buyer.jar -o /tmp/order-res.json -w '%{http_code}' -X POST $B/api/orders \
  -H 'Content-Type: application/json' --data @/tmp/order.json)
check "place order -> 201" "201" "$CODE"
ORDERID=$(node -e "try{process.stdout.write(require('/tmp/order-res.json').orderId)}catch{}" 2>/dev/null)
check "order total = 2 x \$32 = \$64 -> 6400 + shipping 695 = 7095" "7095" \
  "$(node -e "try{process.stdout.write(String(require('/tmp/order-res.json').total))}catch{}" 2>/dev/null)"
STOCK_AFTER=$(dbq 'SELECT stock FROM "Product" WHERE slug=$$essential-cotton-tee$$')
check "stock decremented by 2 ($STOCK_BEFORE -> $STOCK_AFTER)" "$((STOCK_BEFORE-2))" "$STOCK_AFTER"
ORDERS_AFTER=$(dbq 'SELECT count(*) FROM "Order"')
check "one new order row persisted ($ORDERS_BEFORE -> $ORDERS_AFTER)" "$((ORDERS_BEFORE+1))" "$ORDERS_AFTER"
ITEMS_AFTER=$(dbq 'SELECT count(*) FROM "OrderItem"')
check "one new order line persisted ($ITEMS_BEFORE -> $ITEMS_AFTER)" "$((ITEMS_BEFORE+1))" "$ITEMS_AFTER"
curl -s "$B/checkout/success?id=$ORDERID" -o /tmp/success.html
check "success page -> 200 + shows order" "true" \
  "$(grep -qF 'Thank you' /tmp/success.html && grep -qF 'PAID' /tmp/success.html && grep -qF 'Essential Heavyweight Tee' /tmp/success.html && echo true || echo false)"
check "success page shows recalculated total" "true" \
  "$(grep -qF '70.95' /tmp/success.html && echo true || echo false)"
# quantity above the per-line validator cap (max 99) is a validation error
check "quantity 9999 -> 422 (validator cap)" "422" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/orders -H 'Content-Type: application/json' \
     -d "{\"email\":\"$EMAIL\",\"fullName\":\"E2E Buyer\",\"address\":\"12 Test Street\",\"city\":\"Riyadh\",\"postcode\":\"12345\",\"country\":\"Saudi Arabia\",\"lines\":[{\"productId\":\"$TEEPID\",\"size\":\"M\",\"color\":\"White\",\"quantity\":9999}]}")"
# a valid quantity that still exceeds available stock must be a conflict
HOODIEPID=$(dbq 'SELECT id FROM "Product" WHERE slug=$$little-explorer-hoodie$$')
check "quantity 99 > stock 76 -> 409" "409" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/orders -H 'Content-Type: application/json' \
     -d "{\"email\":\"$EMAIL\",\"fullName\":\"E2E Buyer\",\"address\":\"12 Test Street\",\"city\":\"Riyadh\",\"postcode\":\"12345\",\"country\":\"Saudi Arabia\",\"lines\":[{\"productId\":\"$HOODIEPID\",\"size\":\"4Y\",\"color\":\"Mustard\",\"quantity\":99}]}")"
check "unknown product id -> 422" "422" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/orders -H 'Content-Type: application/json' \
     -d "{\"email\":\"$EMAIL\",\"fullName\":\"E2E Buyer\",\"address\":\"12 Test Street\",\"city\":\"Riyadh\",\"postcode\":\"12345\",\"country\":\"Saudi Arabia\",\"lines\":[{\"productId\":\"does-not-exist\",\"size\":\"M\",\"color\":\"White\",\"quantity\":1}]}")"
check "empty bag -> 422" "422" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/orders -H 'Content-Type: application/json' \
     -d '{"email":"a@b.com","fullName":"A B","address":"12 Test St","city":"Riyadh","postcode":"1","country":"KSA","lines":[]}')"

echo "=== STOCK RACE (two concurrent orders for the last unit) ==="
HOODIE=$(dbq 'SELECT id FROM "Product" WHERE slug=$$little-explorer-hoodie$$')
dbq 'UPDATE "Product" SET stock=1 WHERE slug=$$little-explorer-hoodie$$' > /dev/null
RACE="{\"email\":\"$EMAIL\",\"fullName\":\"Race Buyer\",\"address\":\"12 Test Street\",\"city\":\"Riyadh\",\"postcode\":\"12345\",\"country\":\"Saudi Arabia\",\"lines\":[{\"productId\":\"$HOODIE\",\"size\":\"4Y\",\"color\":\"Mustard\",\"quantity\":1}]}"
curl -s -o /tmp/r1.json -w "%{http_code}" -X POST $B/api/orders -H 'Content-Type: application/json' -d "$RACE" > /tmp/r1.code &
curl -s -o /tmp/r2.json -w "%{http_code}" -X POST $B/api/orders -H 'Content-Type: application/json' -d "$RACE" > /tmp/r2.code &
wait
CODES="$(cat /tmp/r1.code) $(cat /tmp/r2.code)"
OK201=$(echo "$CODES" | tr ' ' '\n' | grep -c '^201$')
OK409=$(echo "$CODES" | tr ' ' '\n' | grep -c '^409$')
check "exactly one order wins (201)" "1" "$OK201"
check "the other is rejected (409)" "1" "$OK409"
FINAL_STOCK=$(dbq 'SELECT stock FROM "Product" WHERE slug=$$little-explorer-hoodie$$')
check "stock ends at 0, never negative" "0" "$FINAL_STOCK"
dbq 'UPDATE "Product" SET stock=76 WHERE slug=$$little-explorer-hoodie$$' > /dev/null

echo "=== GALLERY + REVIEWS ==="
curl -s "$B/products/cable-knit-sweater" -o /tmp/pdp2.html
check "PDP shows 2 gallery images" "2" "$(grep -o 'Show image [0-9]' /tmp/pdp2.html | sort -u | wc -l | tr -d ' ')"
check "PDP embeds JSON-LD Product schema" "true" "$(grep -qF 'application/ld+json' /tmp/pdp2.html && grep -qF 'AggregateRating' /tmp/pdp2.html && echo true || echo false)"
check "PDP lists seeded reviews" "true" "$(grep -qF 'Heavy, warm, no bobbling' /tmp/pdp2.html && echo true || echo false)"
SWEATER=$(dbq 'SELECT id FROM "Product" WHERE slug=$$cable-knit-sweater$$')
check "POST review -> 201" "201" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/reviews -H 'Content-Type: application/json' -d "{\"productId\":\"$SWEATER\",\"author\":\"E2E Tester\",\"rating\":5,\"title\":\"Great knit\",\"body\":\"Arrived quickly and the wool is much softer than expected.\"}")"
check "review body too short -> 422" "422" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/reviews -H 'Content-Type: application/json' -d "{\"productId\":\"$SWEATER\",\"author\":\"E2E Tester\",\"rating\":5,\"body\":\"short\"}")"
check "review rating 9 -> 422" "422" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/reviews -H 'Content-Type: application/json' -d "{\"productId\":\"$SWEATER\",\"author\":\"E2E Tester\",\"rating\":9,\"body\":\"A perfectly reasonable length of review text.\"}")"
check "review appears on the page" "true" "$(curl -s "$B/products/cable-knit-sweater" | grep -qF 'Great knit' && echo true || echo false)"

echo "=== COUPONS ==="
check "WELCOME10 valid (10% of 6400 = 640)" "640" "$(curl -s -X POST $B/api/coupons -H 'Content-Type: application/json' -d '{"code":"welcome10","subtotal":6400}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{process.stdout.write(String(JSON.parse(d).discount))}catch{process.stdout.write('ERR')}})")"
check "unknown code -> 422" "422" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/coupons -H 'Content-Type: application/json' -d '{"code":"NOPE","subtotal":6400}')"
check "inactive code -> 422" "422" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/coupons -H 'Content-Type: application/json' -d '{"code":"EXPIRED5","subtotal":6400}')"

echo "=== ORDER WITH COUPON ==="
USED_BEFORE=$(dbq 'SELECT "usedCount" FROM "Coupon" WHERE code=$$WELCOME10$$')
curl -s -o /tmp/coupon-order.json -w "%{http_code}" -b /tmp/buyer.jar -X POST $B/api/orders -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"fullName\":\"Coupon Buyer\",\"address\":\"12 Test Street\",\"city\":\"Riyadh\",\"postcode\":\"12345\",\"country\":\"Saudi Arabia\",\"couponCode\":\"WELCOME10\",\"lines\":[{\"productId\":\"$TEEPID\",\"size\":\"M\",\"color\":\"White\",\"quantity\":2}]}" > /tmp/coupon-order.code
check "order with coupon -> 201" "201" "$(cat /tmp/coupon-order.code)"
check "total = 6400 - 640 + 695 shipping = 6455" "6455" "$(node -e "try{process.stdout.write(String(require('/tmp/coupon-order.json').total))}catch{process.stdout.write('ERR')}")"
USED_AFTER=$(dbq 'SELECT "usedCount" FROM "Coupon" WHERE code=$$WELCOME10$$')
check "coupon usage counted ($USED_BEFORE -> $USED_AFTER)" "$((USED_BEFORE+1))" "$USED_AFTER"
check "bogus coupon on order -> 422" "422" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/orders -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"fullName\":\"C B\",\"address\":\"12 Test Street\",\"city\":\"Riyadh\",\"postcode\":\"12345\",\"country\":\"Saudi Arabia\",\"couponCode\":\"FAKECODE\",\"lines\":[{\"productId\":\"$TEEPID\",\"size\":\"M\",\"color\":\"White\",\"quantity\":1}]}")"

echo "=== COMPARE / SEO / 404 / PAGINATION ==="
curl -s "$B/compare?ids=$TEEPID,$SWEATER" -o /tmp/cmp.html
check "/compare shows both products" "true" "$(grep -qF 'Essential Heavyweight Tee' /tmp/cmp.html && grep -qF 'Cable Knit Wool Sweater' /tmp/cmp.html && echo true || echo false)"
check "/compare has the comparison rows" "true" "$(grep -qF 'Availability' /tmp/cmp.html && grep -qF 'Discount' /tmp/cmp.html && echo true || echo false)"
check "/compare with no ids -> empty state" "true" "$(curl -s "$B/compare" | grep -qF 'Nothing selected yet' && echo true || echo false)"
check "/sitemap.xml lists products" "true" "$(curl -s "$B/sitemap.xml" | grep -qF '/products/cable-knit-sweater' && echo true || echo false)"
check "/robots.txt disallows /admin" "true" "$(curl -s "$B/robots.txt" | grep -qF '/admin' && echo true || echo false)"
check "unknown page -> 404" "404" "$(curl -s -o /dev/null -w '%{http_code}' $B/this-page-does-not-exist)"
check "404 page is the custom one" "true" "$(curl -s $B/this-page-does-not-exist | grep -qF 'This page has been discontinued' && echo true || echo false)"
check "/catalog?page=1 -> 200" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$B/catalog?page=1")"
check "catalog shows the range line" "true" "$(curl -s "$B/catalog" | grep -qF 'Showing 1' && echo true || echo false)"

echo "=== ORDERS DASHBOARDS ==="
curl -s -b /tmp/admin.jar -o /tmp/ao.html -w "%{http_code}" $B/admin/orders > /tmp/ao.code
check "/admin/orders as admin -> 200" "200" "$(cat /tmp/ao.code)"
check "admin orders table renders" "true" "$(grep -qF 'Coupon Buyer' /tmp/ao.html && grep -qF 'WELCOME10' /tmp/ao.html && echo true || echo false)"
curl -s -c /tmp/cust.jar -o /dev/null -X POST $B/api/auth/login -H 'Content-Type: application/json' -d '{"email":"demo@store.test","password":"demo123"}'
check "/account/orders as customer -> 200" "200" "$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/cust.jar $B/account/orders)"
check "/account/orders unauthenticated -> 307" "307" "$(curl -s -o /dev/null -w '%{http_code}' $B/account/orders)"

echo "=== ADMIN: DELETE RULES ==="
check "delete ordered product -> 409 (FK protected)" "409" \
  "$(curl -s -b /tmp/admin.jar -o /dev/null -w '%{http_code}' -X DELETE "$B/api/admin/products/$TEEPID")"
check "delete un-ordered product -> 200" "200" \
  "$(curl -s -b /tmp/admin.jar -o /dev/null -w '%{http_code}' -X DELETE "$B/api/admin/products/$NEWID")"
check "deleted product page -> 404" "404" "$(curl -s -o /dev/null -w '%{http_code}' $B/products/e2e-silk-scarf)"

echo
echo "RESULT: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
