package main

import (
	"log"
	"os"
	"voucher-backend/internal/delivery/http"
	"voucher-backend/internal/infrastructure"
	"voucher-backend/internal/repository"
	"voucher-backend/internal/usecase"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	db := infrastructure.InitDB()

	repo := repository.NewVoucherRepository(db)
	uc := usecase.NewVoucherUsecase(repo)

	r := gin.Default()

	r.Use(http.CORSMiddleware())

	infrastructure.InitRouter(r, uc)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(r.Run(":" + port))
}
