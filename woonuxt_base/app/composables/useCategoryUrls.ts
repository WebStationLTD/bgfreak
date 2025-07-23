interface Category {
  slug?: string | null;
  name?: string | null;
  databaseId?: number | null;
  parent?: {
    node?: {
      slug?: string | null;
      name?: string | null;
      databaseId?: number | null;
    } | null;
  } | null;
  children?: {
    nodes?: Category[] | null;
  } | null;
}

export const useCategoryUrls = () => {
  const runtimeConfig = useRuntimeConfig();
  const productCategoryPermalink = runtimeConfig?.public?.PRODUCT_CATEGORY_PERMALINK || '/product-cat/';

  /**
   * Рекурсивно намира всички slug-ове в йерархията на категорията
   */
  const getCategoryPath = (targetSlug: string, allCategories: Category[]): string[] => {
    const path: string[] = [];

    const findCategoryRecursive = (categories: Category[], targetSlug: string, currentPath: string[]): boolean => {
      for (const category of categories) {
        if (category.slug === targetSlug) {
          path.push(...currentPath, category.slug!);
          return true;
        }

        if (category.children?.nodes) {
          if (findCategoryRecursive(category.children.nodes, targetSlug, [...currentPath, category.slug!])) {
            return true;
          }
        }
      }
      return false;
    };

    findCategoryRecursive(allCategories, targetSlug, []);
    return path;
  };

  /**
   * Генерира правилен URL за категория от всяко ниво
   */
  const generateCategoryUrl = (category: Category, allCategories: Category[] = []): string => {
    if (!category?.slug) return '/categories';

    const path = getCategoryPath(category.slug, allCategories);

    if (path.length === 0) {
      return `${productCategoryPermalink}${category.slug}`;
    }

    return `${productCategoryPermalink}${path.join('/')}`;
  };

  /**
   * Генерира URL директно от път от slug-ове
   */
  const generateUrlFromPath = (slugPath: string[]): string => {
    if (!slugPath || slugPath.length === 0) return '/categories';
    return `${productCategoryPermalink}${slugPath.join('/')}`;
  };

  /**
   * Намира категория по slug в йерархията
   */
  const findCategoryBySlug = (targetSlug: string, categories: Category[]): Category | null => {
    for (const category of categories) {
      if (category.slug === targetSlug) {
        return category;
      }

      if (category.children?.nodes) {
        const found = findCategoryBySlug(targetSlug, category.children.nodes);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Получава пълната йерархия на категорията като обекти
   */
  const getCategoryHierarchy = (targetSlug: string, allCategories: Category[]): Category[] => {
    const hierarchy: Category[] = [];

    const findHierarchyRecursive = (categories: Category[], targetSlug: string, currentHierarchy: Category[]): boolean => {
      for (const category of categories) {
        if (category.slug === targetSlug) {
          hierarchy.push(...currentHierarchy, category);
          return true;
        }

        if (category.children?.nodes) {
          if (findHierarchyRecursive(category.children.nodes, targetSlug, [...currentHierarchy, category])) {
            return true;
          }
        }
      }
      return false;
    };

    findHierarchyRecursive(allCategories, targetSlug, []);
    return hierarchy;
  };

  /**
   * Парсва URL пътека и валидира дали съществува
   */
  const validateCategoryPath = (slugPath: string[], allCategories: Category[]): boolean => {
    if (slugPath.length === 0) return false;

    let currentCategories = allCategories;

    for (let i = 0; i < slugPath.length; i++) {
      const slug = slugPath[i];
      const found = currentCategories.find((cat) => cat.slug === slug);

      if (!found) return false;

      // Ако сме на последния slug, връщаме true
      if (i === slugPath.length - 1) {
        return true;
      }

      // Ако не сме на последния slug, трябва да има деца за да продължим
      if (found.children?.nodes) {
        currentCategories = found.children.nodes;
      } else {
        // Няма деца, но имаме още slug-ове - невалиден път
        return false;
      }
    }

    return true;
  };

  /**
   * Получава родителските категории за breadcrumb
   */
  const getBreadcrumbData = (targetSlug: string, allCategories: Category[]) => {
    const hierarchy = getCategoryHierarchy(targetSlug, allCategories);

    return hierarchy.map((category, index) => ({
      name: category.name,
      slug: category.slug,
      url: generateUrlFromPath(
        hierarchy
          .slice(0, index + 1)
          .map((c) => c.slug)
          .filter(Boolean) as string[],
      ),
      isLast: index === hierarchy.length - 1,
    }));
  };

  /**
   * Проверява дали дадена категория има подкатегории
   */
  const hasChildren = (category: Category): boolean => {
    return Boolean(category.children?.nodes && category.children.nodes.length > 0);
  };

  /**
   * Безопасно декодиране на URI компонент
   */
  const safeDecodeURI = (uri: string | null | undefined): string => {
    if (!uri) return '';
    try {
      return decodeURIComponent(uri);
    } catch {
      return uri;
    }
  };

  return {
    generateCategoryUrl,
    generateUrlFromPath,
    findCategoryBySlug,
    getCategoryPath,
    getCategoryHierarchy,
    validateCategoryPath,
    getBreadcrumbData,
    hasChildren,
    safeDecodeURI,
    productCategoryPermalink,
  };
};
