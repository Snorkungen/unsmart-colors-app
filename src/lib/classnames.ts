export const classnames = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");
export default classnames;