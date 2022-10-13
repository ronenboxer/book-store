'use strict'

const STORAGE_KEY = 'bookDB'
var gPageSize = 0

var gBooks
var gFilter = { maxPrice: Infinity, minRate: 0, txt: "" }
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
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/the-bible.png'
        },
        {
            id: makeId(),
            name: 'Harry Potter (I)',
            author: 'J.K. Rowlin',
            rate: 2,
            price: 29.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/harry-potter.png'
        },
        {
            id: makeId(),
            name: 'Einstein was wrong',
            author: 'Torklid Glaven',
            rate: 10,
            price: 49.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/einstein-was-wrong.png'
        },
        {
            id: makeId(),
            name: 'The Alchemist',
            author: 'Paulo Coelho',
            rate: 3,
            price: 34.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/the-alchemist.png'
        },
        {
            id: makeId(),
            name: 'Algebra',
            author: 'Benny Goren',
            rate: 0,
            price: 4.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/algebra.png'
        },
        {
            id: makeId(),
            name: 'I feel bad about my neck',
            author: 'Norah Ephron',
            rate: 5,
            price: 24.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/i-feel-bad-about-my-neck.png'
        },
        {
            id: makeId(),
            name: 'The tipping point',
            author: 'Malcolm Gladwell',
            rate: 6,
            price: 31.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/the-tipping-point.png'
        },
        {
            id: makeId(),
            name: 'Noughts & Crosses',
            author: 'Malorie Blackman',
            rate: 5,
            price: 39.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/noughts-and-crosses.png'
        },
        {
            id: makeId(),
            name: 'Adults in the room',
            author: 'Yanis Varoufakis',
            rate: 3,
            price: 19.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/adults-in-the-room.png'
        },
        {
            id: makeId(),
            name: 'Caroline',
            author: 'Niel Gaiman',
            rate: 8,
            price: 19.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/caroline.png'
        },
        {
            id: makeId(),
            name: 'Harvest',
            author: 'Jim Grace',
            rate: 5,
            price: 9.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/harvest.png'
        },
        {
            id: makeId(),
            name: 'Days without end',
            author: 'Sebastian Barry',
            rate: 9,
            price: 89.99,
            isOnSale: false,
            about: makeLorem(50),
            imgUrl: './imgs/days-without-end.png'
        }]
    }
    gBooks = books
    _saveBooksToStorage()
}

function setFilter(filterBy= {}) {
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
    gFilter.minRate === 0)) return getDeepCopy(gBooks)
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
    if (book.price > gFilter.maxPrice || book.rate < gFilter.minRate) return false
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
    if (!gPageSize) return getDeepCopy(books)
    if (pageIdx < 0 || !gNumOfPages) pageIdx = 0
    else if (pageIdx >= gNumOfPages) pageIdx = gNumOfPages - 1
    return getDeepCopy(books.slice(pageIdx * gPageSize, gPageSize * (pageIdx + 1)))
}

function setSort(sortBy, orderMultiplier) {
    if (sortBy !== undefined) gSort.sortBy = sortBy
    if (orderMultiplier !== undefined) gSort.orderMultiplier = orderMultiplier
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
    return getDeepCopy(book)
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

function updateBook(bookId, newPrice, isOnSale) {
    const idx = getBookIndexById(bookId)
    if (!gBooks[idx]) return
    gBooks[idx].price = newPrice
    gBooks[idx].isOnSale = isOnSale
    _saveBooksToStorage()
}
function deleteBook(bookId) {
    const idx = getBookIndexById(bookId)
    const book = gBooks.splice(idx, 1)[0]
    if (!book) return null
    _saveBooksToStorage()
    return book
}

function createBook(name, author, price, imgUrl, isOnSale) {
    gBooks = loadFromStorage(STORAGE_KEY)
    gBooks.unshift({
        id: makeId(),
        name,
        author,
        rate: 0,
        price,
        isOnSale,
        about: makeLorem(50),
        imgUrl
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

function setPageSize(size){
    if (isNaN(size) || size < 0) return
    gPageSize = parseInt(size)
}