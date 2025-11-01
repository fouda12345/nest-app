export const generateOTP = (
  length: number = 6,
  bool: string = '0123456789',
): string => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += bool.charAt(Math.trunc(Math.random() * bool.length));
  }
  return otp;
};
