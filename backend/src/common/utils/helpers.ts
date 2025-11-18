export class Helpers {
  static generatePaginationMeta(page: number, perPage: number, total: number) {
    return {
      current_page: page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    };
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}

