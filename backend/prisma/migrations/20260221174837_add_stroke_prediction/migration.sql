-- CreateTable
CREATE TABLE "StrokePrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" DOUBLE PRECISION NOT NULL,
    "gender" TEXT NOT NULL,
    "hypertension" BOOLEAN NOT NULL,
    "heartDisease" BOOLEAN NOT NULL,
    "everMarried" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "residenceType" TEXT NOT NULL,
    "avgGlucoseLevel" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "smokingStatus" TEXT NOT NULL,
    "prediction" INTEGER NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskColor" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "StrokePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrokePrediction_userId_createdAt_idx" ON "StrokePrediction"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StrokePrediction_riskLevel_idx" ON "StrokePrediction"("riskLevel");

-- CreateIndex
CREATE INDEX "StrokePrediction_createdAt_idx" ON "StrokePrediction"("createdAt");
