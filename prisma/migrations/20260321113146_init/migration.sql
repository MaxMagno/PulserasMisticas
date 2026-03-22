-- CreateTable
CREATE TABLE "Mineral" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" TEXT[],
    "benefits" TEXT[],
    "canBePrimary" BOOLEAN NOT NULL DEFAULT true,
    "canBeSecondary" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mineral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CordColor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "style" TEXT NOT NULL DEFAULT 'unisex',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CordColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BraceletDesign" (
    "id" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "notes" TEXT,
    "resultJson" JSONB NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BraceletDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mineral_name_key" ON "Mineral"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CordColor_name_key" ON "CordColor"("name");
