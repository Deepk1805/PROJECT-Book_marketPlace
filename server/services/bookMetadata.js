const axios = require('axios');

class BookMetadataService {
  constructor() {
    this.googleBooksAPI = 'https://www.googleapis.com/books/v1/volumes';
    this.openLibraryAPI = 'https://openlibrary.org';
  }

  // Search Google Books API
  async searchGoogleBooks(query, maxResults = 10) {
    try {
      const response = await axios.get(`${this.googleBooksAPI}`, {
        params: {
          q: query,
          maxResults,
          printType: 'books'
        }
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Google Books API error:', error.message);
      return [];
    }
  }

  // Get book by ISBN from Google Books
  async getBookByISBN(isbn) {
    try {
      const response = await axios.get(`${this.googleBooksAPI}`, {
        params: {
          q: `isbn:${isbn}`
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        return this.formatGoogleBookData(response.data.items[0]);
      }
      return null;
    } catch (error) {
      console.error('Google Books ISBN lookup error:', error.message);
      return null;
    }
  }

  // Format Google Books data to our schema
  formatGoogleBookData(item) {
    const volumeInfo = item.volumeInfo || {};
    const saleInfo = item.saleInfo || {};

    return {
      googleBooksId: item.id,
      title: volumeInfo.title || '',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description || '',
      publisher: volumeInfo.publisher || '',
      publishedDate: volumeInfo.publishedDate || '',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      language: volumeInfo.language || 'en',
      isbn: this.extractISBN(volumeInfo.industryIdentifiers),
      isbn13: this.extractISBN13(volumeInfo.industryIdentifiers),
      images: {
        thumbnail: volumeInfo.imageLinks?.thumbnail || '',
        small: volumeInfo.imageLinks?.small || '',
        medium: volumeInfo.imageLinks?.medium || '',
        large: volumeInfo.imageLinks?.large || ''
      },
      rating: volumeInfo.averageRating || 0,
      reviewCount: volumeInfo.ratingsCount || 0,
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || ''
    };
  }

  // Extract ISBN from industry identifiers
  extractISBN(identifiers) {
    if (!identifiers) return '';
    const isbn = identifiers.find(id => id.type === 'ISBN_10');
    return isbn ? isbn.identifier : '';
  }

  // Extract ISBN-13 from industry identifiers
  extractISBN13(identifiers) {
    if (!identifiers) return '';
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    return isbn13 ? isbn13.identifier : '';
  }

  // Search Open Library
  async searchOpenLibrary(query) {
    try {
      const response = await axios.get(`${this.openLibraryAPI}/search.json`, {
        params: {
          q: query,
          limit: 10
        }
      });

      return response.data.docs || [];
    } catch (error) {
      console.error('Open Library API error:', error.message);
      return [];
    }
  }

  // Get book details from Open Library
  async getOpenLibraryBook(olid) {
    try {
      const response = await axios.get(`${this.openLibraryAPI}/works/${olid}.json`);
      return response.data;
    } catch (error) {
      console.error('Open Library book lookup error:', error.message);
      return null;
    }
  }

  // Auto-populate book metadata
  async enrichBookData(bookData) {
    const enrichedData = { ...bookData };

    try {
      // Try to find book by ISBN first
      if (bookData.isbn || bookData.isbn13) {
        const isbn = bookData.isbn13 || bookData.isbn;
        const googleBookData = await this.getBookByISBN(isbn);
        
        if (googleBookData) {
          enrichedData.metadata = {
            ...enrichedData.metadata,
            googleBooksId: googleBookData.googleBooksId,
            isbn: googleBookData.isbn || enrichedData.metadata?.isbn,
            isbn13: googleBookData.isbn13 || enrichedData.metadata?.isbn13,
            publishedDate: googleBookData.publishedDate,
            publisher: googleBookData.publisher,
            pageCount: googleBookData.pageCount,
            language: googleBookData.language
          };

          if (googleBookData.images.thumbnail) {
            enrichedData.image = googleBookData.images.thumbnail;
            enrichedData.images = [
              googleBookData.images.thumbnail,
              googleBookData.images.small,
              googleBookData.images.medium,
              googleBookData.images.large
            ].filter(Boolean);
          }

          enrichedData.externalRatings = {
            ...enrichedData.externalRatings,
            googleBooks: {
              rating: googleBookData.rating,
              reviewCount: googleBookData.reviewCount
            }
          };

          if (googleBookData.categories && googleBookData.categories.length > 0) {
            enrichedData.genres = googleBookData.categories;
          }

          if (googleBookData.authors && googleBookData.authors.length > 0) {
            enrichedData.authors = googleBookData.authors;
            enrichedData.author = googleBookData.authors[0]; // Keep primary author
          }

          if (!enrichedData.description && googleBookData.description) {
            enrichedData.description = googleBookData.description;
          }
        }
      }

      // If no ISBN, try searching by title and author
      if (!enrichedData.metadata?.googleBooksId && bookData.title && bookData.author) {
        const searchQuery = `${bookData.title} ${bookData.author}`;
        const searchResults = await this.searchGoogleBooks(searchQuery, 1);
        
        if (searchResults.length > 0) {
          const googleBookData = this.formatGoogleBookData(searchResults[0]);
          
          // Only use data if it's a close match
          if (this.isCloseMatch(bookData, googleBookData)) {
            enrichedData.metadata = {
              ...enrichedData.metadata,
              ...googleBookData
            };
          }
        }
      }

    } catch (error) {
      console.error('Error enriching book data:', error.message);
    }

    return enrichedData;
  }

  // Check if search result is a close match
  isCloseMatch(originalBook, searchResult) {
    const titleSimilarity = this.calculateSimilarity(
      originalBook.title.toLowerCase(),
      searchResult.title.toLowerCase()
    );
    
    const authorSimilarity = searchResult.authors.some(author =>
      this.calculateSimilarity(
        originalBook.author.toLowerCase(),
        author.toLowerCase()
      ) > 0.7
    );

    return titleSimilarity > 0.7 && authorSimilarity;
  }

  // Simple string similarity calculation
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance calculation
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

module.exports = new BookMetadataService();
