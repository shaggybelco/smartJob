-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "resumeFilename" TEXT,
ADD COLUMN     "resumeMimeType" TEXT,
ADD COLUMN     "resumeSize" INTEGER,
ADD COLUMN     "resumeStorageKey" TEXT,
ALTER COLUMN "coverLetter" DROP NOT NULL;
