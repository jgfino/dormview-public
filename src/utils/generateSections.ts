export interface Section<T> {
  title: string | null;
  data: T[];
}

/**
 * Generates sections from the given data
 * @param data            Data to generate sections for
 * @param titleExtractor  Function to extract section titles
 * @returns
 */
export default function generateSections<T>(
  data: T[],
  titleExtractor: (obj: T) => string | null,
) {
  return data.reduce((section: Section<T>[], item) => {
    const title = titleExtractor(item);

    let index = section.findIndex((item: Section<T>) => item.title === title);

    if (index < 0) {
      index = section.length;
      section[index] = {title: title, data: []};
    }

    section[index].data.push(item);
    return section;
  }, []);
}
