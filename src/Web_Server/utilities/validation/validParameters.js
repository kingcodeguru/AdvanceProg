const { HttpError, STATUSCODE } = require('../errors/HttpError');

// expected json strctures for each class
const expectedStruct = {
  Permissions: ["fid", "uid", "role"],
  // I don't check parent_id because it's optional - and if it's empty I add null to the field
  FileDir: ["name", "is_file", "type"],
  // I don't check creation_date because the server creates it
  User: ["name", "avatar", "password", "email"]
};

/**
 * helper function that validates if a JSON object has exactly the keys required by the expected structure.
 * We don't allow any field to be empty!
 * @param {string} schemaName - The name of the schema to check against.
 * @param {Object} data - The JSON object to validate.
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
function validate(expectedFields, data) {
  const dataKeys = Object.keys(data);

  // Content check
  for (const key of expectedFields) {
    if (!dataKeys.includes(key)) {
      // console.log(`Missing required key: "${key}"`);
      return { isValid: false, error: `Missing required key: "${key}"` };
    } else if (data[key] === null || data[key] === undefined || data[key] === "") {
      // console.log(`Empty key: ${key}`);
      return { isValid: false, error: `Empty key: "${key}"` };
    }
  }

  return { isValid: true, error: null };
}

function validateUser(user) {
  user.creation_date = new Date();
  const valid_check = validate(expectedStruct["User"], user);
  if (!valid_check.isValid) {
    throw new HttpError(STATUSCODE.NOT_FOUND, valid_check.error);
  }
}

function validateFileDir(filedir) {
  filedir.parent_id = filedir.parent_id || null;
  filedir.creation_date = new Date();
  filedir.last_viewed = new Date();
  filedir.last_modified = new Date();
  filedir.type = filedir.type || 'text';
  if (!filedir.is_file) {filedir.type = 'directory';}

  const valid_check = validate(expectedStruct["FileDir"], filedir);
  if (!valid_check.isValid) {
      throw new HttpError(STATUSCODE.NOT_FOUND, valid_check.message);
  }
}

function validatePermission(permission) {
  const valid_check = validate(expectedStruct["Permissions"], permission);
  if (!valid_check.isValid) {
      throw new HttpError(STATUSCODE.NOT_FOUND, valid_check.message);
  }
}

module.exports = { 
    validateUser,
    validateFileDir,
    validatePermission
 };
