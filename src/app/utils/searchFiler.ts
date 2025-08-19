export const searchFilter = (search: string | null) => {
  if (!search) {
    return undefined;
  }

  const filters: any = {};

  if (search) {
    filters.OR = [{ name: { contains: search, mode: "insensitive" } }];
  }

  //  const filters: any = {
  //    OR: [
  //      { status: { equals: search } }, // Exact match for status
  //    ],
  //  };

  // console.log(status);

  // if (status) {
  //   filters.OR.push({ role: { equals: status } });
  // }

  return filters;
};


export const productFilter = (search: string | null) => {
  if (!search) {
    return undefined;
  }

  const filters: any = {};

  if (search) {
    filters.OR = [{ title: { contains: search, mode: "insensitive" } }];
  }

  return filters;
};