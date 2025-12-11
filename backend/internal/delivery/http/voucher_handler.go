package http

import (
	"bytes"
	"encoding/csv"
	"net/http"
	"strconv"
	"time"
	"voucher-backend/internal/domain"

	"github.com/gin-gonic/gin"
)

type VoucherHandler struct {
	uc domain.VoucherUsecase
}

func NewVoucherHandler(r *gin.RouterGroup, uc domain.VoucherUsecase) *VoucherHandler {
	handler := &VoucherHandler{uc: uc}

	r.GET("/vouchers", handler.Fetch)
	r.GET("/vouchers/:id", handler.GetByID)
	r.POST("/vouchers", handler.Store)
	r.PUT("/vouchers/:id", handler.Update)
	r.DELETE("/vouchers/:id", handler.Delete)

	return handler
}

func (h *VoucherHandler) Fetch(c *gin.Context) {
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort_by", "expiry_date")
	order := c.DefaultQuery("order", "asc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	data, total, _ := h.uc.Fetch(search, sortBy, order, page, pageSize)

	type VoucherResp struct {
		ID              uint   `json:"id"`
		VoucherCode     string `json:"voucher_code"`
		DiscountPercent int    `json:"discount_percent"`
		ExpiryDate      string `json:"expiry_date"`
		CreatedAt       string `json:"created_at"`
		UpdatedAt       string `json:"updated_at"`
	}

	resp := make([]VoucherResp, len(data))
	for i, v := range data {
		resp[i] = VoucherResp{
			ID:              v.ID,
			VoucherCode:     v.VoucherCode,
			DiscountPercent: v.DiscountPercent,
			ExpiryDate:      v.ExpiryDate.Format("2006-01-02"),
			CreatedAt:       v.CreatedAt.Format(time.RFC3339),
			UpdatedAt:       v.UpdatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": resp, "total": total})
}

func (h *VoucherHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, _ := strconv.Atoi(idParam)

	v, err := h.uc.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	resp := struct {
		ID              uint   `json:"id"`
		VoucherCode     string `json:"voucher_code"`
		DiscountPercent int    `json:"discount_percent"`
		ExpiryDate      string `json:"expiry_date"`
		CreatedAt       string `json:"created_at"`
		UpdatedAt       string `json:"updated_at"`
	}{
		ID:              v.ID,
		VoucherCode:     v.VoucherCode,
		DiscountPercent: v.DiscountPercent,
		ExpiryDate:      v.ExpiryDate.Format("2006-01-02"),
		CreatedAt:       v.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       v.UpdatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, resp)
}

func (h *VoucherHandler) Store(c *gin.Context) {
	var in domain.CreateVoucherInput

	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if in.DiscountPercent < 1 || in.DiscountPercent > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "discount must be 1-100"})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", in.ExpiryDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	voucher := domain.Voucher{
		VoucherCode:     in.VoucherCode,
		DiscountPercent: in.DiscountPercent,
		ExpiryDate:      parsedDate,
	}

	if err := h.uc.Store(&voucher); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, voucher)
}

func (h *VoucherHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var in domain.UpdateVoucherInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if in.DiscountPercent < 1 || in.DiscountPercent > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "discount must be 1-100"})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", in.ExpiryDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	existing, err := h.uc.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "voucher not found"})
		return
	}

	existing.VoucherCode = in.VoucherCode
	existing.DiscountPercent = in.DiscountPercent
	existing.ExpiryDate = parsedDate
	existing.UpdatedAt = time.Now()

	if err := h.uc.Update(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func (h *VoucherHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, _ := strconv.Atoi(idParam)
	h.uc.Delete(uint(id))
	c.Status(http.StatusNoContent)
}

func (h *VoucherHandler) UploadCSV(c *gin.Context) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	success, failed, report, err := h.uc.UploadCSV(c, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": success,
		"failed":  failed,
		"report":  report,
	})
}

func (h *VoucherHandler) ExportCSV(c *gin.Context) {
	data, _, _ := h.uc.Fetch("", "expiry_date", "asc", 1, 99999)
	b := &bytes.Buffer{}
	writer := csv.NewWriter(b)
	writer.Write([]string{"voucher_code", "discount_percent", "expiry_date"})
	for _, v := range data {
		writer.Write([]string{
			v.VoucherCode,
			strconv.Itoa(v.DiscountPercent),
			v.ExpiryDate.Format("2006-01-02"),
		})
	}
	writer.Flush()
	c.Header("Content-Disposition", "attachment; filename=vouchers.csv")
	c.Data(http.StatusOK, "text/csv", b.Bytes())
}
