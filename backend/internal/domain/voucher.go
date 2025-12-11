package domain

import (
	"context"
	"mime/multipart"
	"time"
)

type Voucher struct {
	ID              uint      `json:"id"`
	VoucherCode     string    `json:"voucher_code"`
	DiscountPercent int       `json:"discount_percent"`
	ExpiryDate      time.Time `json:"expiry_date"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CreateVoucherInput struct {
	VoucherCode     string `json:"voucher_code"`
	DiscountPercent int    `json:"discount_percent"`
	ExpiryDate      string `json:"expiry_date"`
}

type UpdateVoucherInput struct {
	VoucherCode     string `json:"voucher_code"`
	DiscountPercent int    `json:"discount_percent"`
	ExpiryDate      string `json:"expiry_date"`
}

// Behavior / Interface

type VoucherRepository interface {
	Fetch(search string, sortBy string, order string, limit int, offset int) ([]Voucher, int64, error)
	GetByID(id uint) (*Voucher, error)
	Store(v *Voucher) error
	Update(v *Voucher) error
	Delete(id uint) error
}

type VoucherUsecase interface {
	Fetch(search string, sortBy string, order string, page int, pageSize int) ([]Voucher, int64, error)
	GetByID(id uint) (*Voucher, error)
	Store(v *Voucher) error
	Update(v *Voucher) error
	Delete(id uint) error
	UploadCSV(ctx context.Context, file multipart.File) (success int, failed int, report []map[string]string, err error)
}
