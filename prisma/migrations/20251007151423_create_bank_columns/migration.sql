-- AlterTable
ALTER TABLE "payment_configs" ADD COLUMN     "account_holder" TEXT,
ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_agency" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "pix_key" TEXT,
ADD COLUMN     "receive_via_bank" BOOLEAN NOT NULL DEFAULT false;
