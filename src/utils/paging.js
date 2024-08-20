export const getPagination = (page, limit = 10) => {
    if (page > 0) {
        page = page - 1
    }
    const offset = page ? page * limit : 0
    return { limit, offset } //offset bỏ qua số data lấy ra // ví dụ trang 1 thì lấy limit phầm từ  bỏ qua offset
}

export const getPaginData = (data, total, page = 0, offset = 10) => {
    const currentPage = page ? page : 0
    const totalPages = total > 0 && total <= 10 ? 1 : Math.ceil(total / offset)
    const result = { total: total, totalPages: totalPages, currentPage: parseInt(currentPage), data: data }
    return result
}