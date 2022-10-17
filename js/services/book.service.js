'use strict'

const STORAGE_KEY = 'bookDB'
var gPageSize = 0

var gBooks
var gFilter = { maxPrice: Infinity, minRate: 0, txt: "", isBookmarked: false }
var gSort = { sortBy: '', orderMultiplier: 1 }
_createBooks()
var gNumOfPages = !gPageSize ? 0 : Math.ceil(gBooks.length / gPageSize)

function _createBooks() {
    var books = loadFromStorage(STORAGE_KEY)

    if (!books || !books.length) {
        books = [{
            id: makeId(),
            name: 'The Bible',
            author: 'GOD',
            rate: 10,
            price: 19.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/the-bible.png'
        },
        {
            id: makeId(),
            name: 'Harry Potter (I)',
            author: 'J.K. Rowlin',
            rate: 2,
            price: 29.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/harry-potter.png'
        },
        {
            id: makeId(),
            name: 'Einstein was wrong',
            author: 'Torklid Glaven',
            rate: 10,
            price: 49.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/einstein-was-wrong.png'
        },
        {
            id: makeId(),
            name: 'The Alchemist',
            author: 'Paulo Coelho',
            rate: 3,
            price: 34.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/the-alchemist.png'
        },
        {
            id: makeId(),
            name: 'Algebra',
            author: 'Benny Goren',
            rate: 0,
            price: 4.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/algebra.png'
        },
        {
            id: makeId(),
            name: 'I feel bad about my neck',
            author: 'Norah Ephron',
            rate: 5,
            price: 24.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/i-feel-bad-about-my-neck.png'
        },
        {
            id: makeId(),
            name: 'The tipping point',
            author: 'Malcolm Gladwell',
            rate: 6,
            price: 31.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/the-tipping-point.png'
        },
        {
            id: makeId(),
            name: 'Noughts & Crosses',
            author: 'Malorie Blackman',
            rate: 5,
            price: 39.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/noughts-and-crosses.png'
        },
        {
            id: makeId(),
            name: 'Adults in the room',
            author: 'Yanis Varoufakis',
            rate: 3,
            price: 19.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/adults-in-the-room.png'
        },
        {
            id: makeId(),
            name: 'Caroline',
            author: 'Niel Gaiman',
            rate: 8,
            price: 19.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/caroline.png'
        },
        {
            id: makeId(),
            name: 'Harvest',
            author: 'Jim Grace',
            rate: 5,
            price: 9.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/harvest.png'
        },
        {
            id: makeId(),
            name: 'Days without end',
            author: 'Sebastian Barry',
            rate: 9,
            price: 89.99,
            isBookmarked: false,
            about: makeLoremEng(75),
            imgUrl: './imgs/book-covers/days-without-end.png'
        }]
    }
    gBooks = books
    _saveBooksToStorage()
}

function setFilter(filterBy = {}) {
    for (var prop in gFilter) {
        if (filterBy[prop] !== undefined) gFilter[prop] = filterBy[prop]
    }
}

function getFilteredBooks() {
    gBooks = loadFromStorage(STORAGE_KEY)
    sortBooks()
    gNumOfPages = calculteNumOfPages(gBooks)
    if (!gFilter || (gFilter.txt === '' &&
        gFilter.maxPrice >= getBookPricedRange().max &&
        gFilter.minRate === 0 && !gFilter.isBookmarked)) return gBooks
    const books = gBooks.filter(book => isFitForFilter(book))
    gNumOfPages = calculteNumOfPages(books)
    return books
}

function isFitForFilter(book) {
    var isAnyStrMatches = true
    if (gFilter.txt !== '') {
        isAnyStrMatches = false
        for (var bookProp in book) {
            if (bookProp === 'id' ||
                bookProp === 'name' ||
                bookProp === 'author') {
                if (book[bookProp].toLowerCase().includes(gFilter.txt.toLowerCase())) {
                    isAnyStrMatches = true
                    break;
                }
            }
        }
    }
    if (!isAnyStrMatches) return false
    if (book.price > gFilter.maxPrice || book.rate < gFilter.minRate || book.isBookmarked !== gFilter.isBookmarked) return false
    return true
}

function getNumOfPages() {
    return gNumOfPages
}

function calculteNumOfPages(books) {
    return !gPageSize ? 0 : Math.ceil(books.length / gPageSize)
}

function getBooksByPage(pageIdx) {
    var books = getFilteredBooks()
    if (!gPageSize) return books
    if (pageIdx < 0 || !gNumOfPages) pageIdx = 0
    else if (pageIdx >= gNumOfPages) pageIdx = gNumOfPages - 1
    return books.slice(pageIdx * gPageSize, gPageSize * (pageIdx + 1))
}

function setSort(sortKeys) {
    if (sortKeys.sortBy !== undefined) gSort.sortBy = sortKeys.sortBy
    if (sortKeys.orderMultiplier !== undefined) gSort.orderMultiplier = sortKeys.orderMultiplier
    else gSort.sortBy = sortKeys.sortBy
}

function sortBooks() {
    const sortBy = gSort.sortBy
    const multiplier = gSort.orderMultiplier
    if (!sortBy) {
        if (multiplier === -1) return gBooks = gBooks.reverse()
        return gBooks
    }
    gBooks.sort((book1, book2) => {
        if (typeof book1[sortBy] === 'string' &&
            typeof book2[sortBy] === 'string') return book1[sortBy].localeCompare(book2[sortBy]) * multiplier
        return (book1[sortBy] - book2[sortBy]) * multiplier
    })
}

function _saveBooksToStorage() {
    saveToStorage(STORAGE_KEY, gBooks)
}

function getBookIndexById(bookId) {
    return gBooks.findIndex(book => book.id === bookId)
}

function getBookById(bookId) {
    const book = gBooks.find(book => book.id === bookId)
    if (!book) return null
    return book
}

function setBookRate(bookId, newRate) {
    gBooks[getBookIndexById(bookId)].rate = newRate
    _saveBooksToStorage()
}

function toggleFavorite(bookId) {
    const idx = getBookIndexById(bookId)
    if (!gBooks[idx]) return null
    if (gBooks[idx].isFavorite === undefined) gBooks[idx].isFavorite = true
    else gBooks[idx].isFavorite = !gBooks[idx].isFavorite
    _saveBooksToStorage()
}

function updateBook(bookId, newVals) {
    const book = getBookById(bookId)
    if (!book) return
    if (isTheSame(book, newVals)) return
    for (var prop in newVals) {
        if (newVals[prop] === '' ||
            prop === 'price' && isNaN(newVals[prop])) continue
            book[prop] = newVals[prop]
    }
    _saveBooksToStorage()
}

function isTheSame(book, compare) {
    for (var prop in compare) {
        const val = compare[prop]
        if (val === null || val === undefined ||
        val === '' || (!isNaN(val) && +val < 0)) continue
            if (val !== book[prop])return false
    }
    return true
}

function deleteBook(bookId) {
    const idx = getBookIndexById(bookId)
    const book = gBooks.splice(idx, 1)[0]
    if (!book) return null
    _saveBooksToStorage()
    return book
}

function createBook(bookVals) {
    gBooks = loadFromStorage(STORAGE_KEY)
    gBooks.unshift({
        id: makeId(),
        name: bookVals.name,
        author: bookVals.author,
        rate: bookVals.rate,
        price: bookVals.price,
        isBookmarked: bookVals.isBookmarked,
        about: makeLoremEng(50),
        imgUrl: bookVals.imgUrl
    })
    _saveBooksToStorage()
}

function getBookPricedRange() {
    var min = Infinity
    var max = 0
    gBooks.forEach(book => {
        if (book.price > max) max = book.price
        if (book.price < min) min = book.price
    })
    return { min, max }
}

function setPageSize(size) {
    if (isNaN(size) || size < 0) return
    gPageSize = parseInt(size)
}