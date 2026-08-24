-- Store the payment provider reference on the order.

ALTER TABLE "Order" ADD COLUMN "paymentReference" TEXT;
