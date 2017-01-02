/**
 * Creates a new error object with a specified error message and a specific
 * innerError property.
 *
 * @param  {string} message - The message for the new error object
 * @param  {Error} innerError - The innerError for the new error object
 * @return {Error} - The created Error object
 */
export default function throwWrappedError(message, innerError) {

  const newError = new Error(message);
  newError.innerError = innerError;

  throw newError;
}
