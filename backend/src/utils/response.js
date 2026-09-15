const successResponse = ({
  res,
  statusCode = 200,
  message = "Request successful",
  data = null,
  pagination = null,
}) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = ({
  res,
  statusCode = 500,
  message = "Something went wrong",
  errors = null,
}) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};