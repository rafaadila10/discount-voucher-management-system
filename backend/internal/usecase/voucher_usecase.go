package usecase

import (
	"context"
	"encoding/csv"
	"io"
	"mime/multipart"
	"strconv"
	"time"
	"voucher-backend/internal/domain"
)

type voucherUsecase struct {
	repo domain.VoucherRepository
}

func NewVoucherUsecase(r domain.VoucherRepository) domain.VoucherUsecase {
	return &voucherUsecase{repo: r}
}

func (u *voucherUsecase) Fetch(search, sortBy, order string, page, pageSize int) ([]domain.Voucher, int64, error) {
	offset := (page - 1) * pageSize
	return u.repo.Fetch(search, sortBy, order, pageSize, offset)
}

func (u *voucherUsecase) GetByID(id uint) (*domain.Voucher, error) {
	return u.repo.GetByID(id)
}

func (u *voucherUsecase) Store(v *domain.Voucher) error {
	return u.repo.Store(v)
}

func (u *voucherUsecase) Update(v *domain.Voucher) error {
	return u.repo.Update(v)
}

func (u *voucherUsecase) Delete(id uint) error {
	return u.repo.Delete(id)
}

func (u *voucherUsecase) UploadCSV(ctx context.Context, file multipart.File) (int, int, []map[string]string, error) {
	reader := csv.NewReader(file)

	success := 0
	failed := 0
	report := []map[string]string{}

	for {
		rec, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil || len(rec) < 3 {
			failed++
			continue
		}

		// Parse record
		v := domain.Voucher{
			VoucherCode: rec[0],
		}

		disc, err := strconv.Atoi(rec[1])
		if err != nil {
			failed++
			report = append(report, map[string]string{"row": rec[0], "status": "invalid discount"})
			continue
		}
		v.DiscountPercent = disc

		exp, err := time.Parse("2006-01-02", rec[2])
		if err != nil {
			failed++
			report = append(report, map[string]string{"row": rec[0], "status": "invalid date"})
			continue
		}
		v.ExpiryDate = exp

		if err := u.repo.Store(&v); err != nil {
			failed++
			report = append(report, map[string]string{"row": rec[0], "status": err.Error()})
			continue
		}

		success++
		report = append(report, map[string]string{"row": rec[0], "status": "ok"})
	}

	return success, failed, report, nil
}
