// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export function removeProps(obj: Record<string, any>, propsToRemove: string[]) {
//   let newObj: Record<string, any> = {};
//   Object.keys(obj).forEach((key) => {
//     if (propsToRemove.indexOf(key) === -1) newObj[key] = obj[key];
//   });
//   return newObj;
// }

// const StyledInput = styled.input(({ hasBorder }) => [
//   `color: black;`,
//   hasBorder && tw`border-purple-500`,
// ])

// const StyledInput = styled.input`
//   color: black;
//   ${({ hasBorder }) => hasBorder && tw`border-purple-500`}
// `
// const Input = () => <StyledInput hasBorder />
