/**
 * filter request body that are not allowed to be updated
 * @param {request} requestBody
 * @param {array} allowedFields
 * @returns allowedfiled object
 */
module.exports = (requestBody, allowedFields) => {
  const newObj = {};
  Object.keys(requestBody).forEach((el) => {
    if ([...allowedFields].includes(el)) newObj[el] = requestBody[el];
  });
  return newObj;
};
