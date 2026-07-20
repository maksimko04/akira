class ResponseService {
    success(res, data, meta) {
        res.json({ status: "success", data, meta });
    }
};

export default new ResponseService();