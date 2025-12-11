package repository

import (
	"voucher-backend/internal/domain"

	"gorm.io/gorm"
)

type voucherRepository struct {
	db *gorm.DB
}

func NewVoucherRepository(db *gorm.DB) domain.VoucherRepository {
	return &voucherRepository{db}
}

func (r *voucherRepository) Fetch(search, sortBy, order string, limit, offset int) ([]domain.Voucher, int64, error) {
	var vouchers []domain.Voucher
	var total int64

	q := r.db.Model(&domain.Voucher{})

	if search != "" {
		q = q.Where("voucher_code LIKE ?", "%"+search+"%")
	}

	q.Count(&total)
	q.Order(sortBy + " " + order).Limit(limit).Offset(offset).Find(&vouchers)

	return vouchers, total, nil
}

func (r *voucherRepository) GetByID(id uint) (*domain.Voucher, error) {
	var v domain.Voucher
	if err := r.db.First(&v, id).Error; err != nil {
		return nil, err
	}
	return &v, nil
}

func (r *voucherRepository) Store(v *domain.Voucher) error {
	return r.db.Create(v).Error
}

func (r *voucherRepository) Update(v *domain.Voucher) error {
	return r.db.Save(v).Error
}

func (r *voucherRepository) Delete(id uint) error {
	return r.db.Delete(&domain.Voucher{}, id).Error
}
