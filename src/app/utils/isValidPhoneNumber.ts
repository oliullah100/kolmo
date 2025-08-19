 export const phoneRegex = /^\+?[1-9]\d{1,14}$/;
export  const isValidPhoneNumber = (phone: string): boolean => {
  return phoneRegex.test(phone);
};



