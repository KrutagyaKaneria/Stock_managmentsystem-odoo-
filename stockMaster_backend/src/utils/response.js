export const success = (res, data, message = "OK") =>
  res.json({ success: true, message, data });

export const fail = (res, message = "Error", status = 400) =>
  res.status(status).json({ success: false, message });