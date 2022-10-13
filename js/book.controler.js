'use strict'

const CLOSE_ICON = '<iconify-icon inline icon="carbon:close-filled"></iconify-icon>'
var gCurrViewState = { renderAs: renderAsTable }
var gCurrPage = 0
const gCurrOpenModal = {}
const gModalObjectSwitch = {
    add: () => onAddModal(),
    read: bookId => onReadModal(bookId),
    update: bookId => onUpdateModal(bookId),
    nav: () => onNavModal(),
    delete: bookId => onDeleteModal(bookId)
}
var pageSize = 0

const HEART_ICON = '<iconify-icon width="1.5rem" inline icon="ci:heart-fill"></iconify-icon>'
const READ_ICON = '<iconify-icon width="1.5rem" inline icon="akar-icons:book"></iconify-icon>'
const UPDATE_ICON = '<iconify-icon width="1.5rem" inline icon="arcticons:oxygenupdater"></iconify-icon>'
const DELETE_ICON = '<iconify-icon width="1.5rem" inline icon="bytesize:trash"></iconify-icon>'

function onInit() {
    renderByQueryStrParam()
    gCurrViewState.renderAs(gCurrPage)
}

function renderAsTable() {
    const books = getFilteredBooks()
    const elContainer = document.querySelector('.books-container')
    elContainer.classList.remove('flex')
    elContainer.innerHTML = `<table>
    <thead>
    <tr>
        <th>id</th>
        <th class="align-left">Title</th>
        <th class="align-left">Author</th>
        <th>Price</th>
        <th>Rating</th>
        <th colspan="3">Actions</th>
    </tr>
        </thead>
        <tbody></tbody>
    </table>`
    const HTMLs = books.map(book => `
    <tr>
        <td>${book.id}</td>
        <td class="align-left">${book.name}</td>
        <td class="align-left">${book.author}</td>
        <td class="align-left">${book.price}$</td>
        <td>${book.rate}</td>
        <td><button class="read" onclick="onReadModal('${book.id}')">${READ_ICON}</button></td>
        <td><button class="updtae" onclick="onUpdateModal('${book.id}')">${UPDATE_ICON}</button></td>
        <td><button class="delete"  onclick="onDeleteModal('${book.id}')">${DELETE_ICON}</button></td>
    </tr>`)
    document.querySelector('tbody').innerHTML = HTMLs.join('')
    document.querySelector('footer').innerHTML = ''

    saveQueryStrParams()
}

function renderAsCards(pageIdx = 0) {
    const books = getBooksByPage(pageIdx)
    const numOfPages = getNumOfPages()
    if (pageIdx >= numOfPages && numOfPages) gCurrPage = numOfPages - 1
    else if (pageIdx < 0) gCurrPage = 0
    else gCurrPage = pageIdx
    const elContainer = document.querySelector('.books-container')
    elContainer.classList.add('flex')
    elContainer.innerHTML = books.map(book => {
        return `<article class="card ${book.id}">
        <span>${book.name} by ${book.author}</span>
        <span>${book.price}$ <button class="updtae" onclick="onUpdateModal('${book.id}')">${UPDATE_ICON}</button> id: ${book.id}</span>
        <img onerror="this.src='imgs/unkown.png'" src="${book.imgUrl}">
        <p>About: ${book.about}</p>
        <div class="cards-control">
            Rate book:<br>
            <button class="rate-down" onclick="onChangeRate('${book.id}', -1)">-</button>
            <span class="book-rating" >${book.rate}</span>
            <button class="rate-up" onclick="onChangeRate('${book.id}', 1)">+</button>
            <br>
            <button name="toggle-favorite-cards" onclick="onToggleFavorite('${book.id}', this)"
            ${book.isFavorite === undefined ? '' : 'class="favorite"'}>${HEART_ICON}</button>
            <button class="delete" onclick="onDeleteModal('${book.id}')">${DELETE_ICON}</button>
        </div>
        </article>`
    }).join('')
    document.querySelector('footer').innerHTML = getPageNumsHtmlStr(pageIdx, numOfPages, 'renderAsCards')
    document.querySelector('.view-per-page').innerHTML = `books per page: 
    <span onclick="onSetPageSize(1)">1</span> | 
    <span onclick="onSetPageSize(2)">2</span> | 
    <span onclick="onSetPageSize(5)">5</span> | 
    <span onclick="onSetPageSize(10)">10</span> | 
    <span onclick="onSetPageSize(0)">infinity</span> `
    saveQueryStrParams()
}

function onToggleViewMode() {
    document.querySelectorAll('.view-bttn iconify-icon').forEach(icon => icon.classList.toggle('selected'))

    if (gCurrViewState.renderAs === renderAsTable) gCurrViewState.renderAs = renderAsCards
    else gCurrViewState.renderAs = renderAsTable
    gCurrViewState.renderAs(gCurrPage)
}

function onChangeRate(bookId, nextRate,) {
    const book = getBookById(bookId)
    const newRate = book.rate + nextRate
    if (newRate === -1 || newRate === 11) return
    setBookRate(bookId, newRate)
    document.querySelectorAll('.book-rating').forEach(element => element.innerText = newRate)
}

function onToggleFavorite(bookId, elButton) {
    toggleFavorite(bookId)
    elButton.classList.toggle('favorite')
}

function onReadModal(bookId) {
    gCurrOpenModal.modal = 'read'
    gCurrOpenModal.bookId = bookId
    const book = getBookById(bookId)
    if (!book) return
    onOpenModal(`read-modal`)
    document.querySelector('.read-modal span').innerText = `${book.name}`
    document.querySelector('.read-modal p').innerHTML = `<img onerror="this.src='imgs/unkown.png'" src="${book.imgUrl}">${book.about}`
    document.querySelector('.rate').innerHTML = `<button class="rate-down" onclick="onChangeRate('${book.id}', -1)">-</button>
    <span class="book-rating">${book.rate}</span>
    <button class="rate-up" onclick="onChangeRate('${book.id}', 1)">+</button>
    <br>
    <button ${!book.isFavorite ? '' : 'class="favorite"'}name="toggle-favorite-table"
    onclick="onToggleFavorite('${book.id}', this)">${HEART_ICON}</button>`
}

function onUpdateModal(bookId) {
    gCurrOpenModal.modal = 'update'
    gCurrOpenModal.bookId = bookId
    const book = getBookById(bookId)
    if (!book) return
    onOpenModal(`update-modal`)
    document.querySelector('.update-modal div').innerHTML = `<form onsubmit="onUpdateBook(event, this, '${bookId}')">
    <label>Enter new price for <span>${book.name}</span><input name="price" type="text" value="${book.price}" /></lable>
        <label>Is the book on sale? <input name="is-on-sale" type="checkbox" ${book.isOnSale ? "checked" : ""}></label>
        <button>Update</button>
    </form>`
}

function onDeleteModal(bookId) {
    gCurrOpenModal.modal = 'delete'
    gCurrOpenModal.bookId = bookId
    const book = getBookById(bookId)
    if (!book) return
    onOpenModal(`delete-modal`)
    document.querySelector('.delete-modal').innerHTML = `Are you sure? <br>
    <button class="delete-bttn" onclick="onDeleteBook('${bookId}')">Yes</button>
    <button onclick="onCloseModal('.delete-modal')">No</button>`
}

function onNavModal() {
    gCurrOpenModal.modal = 'nav'
    gCurrOpenModal.bookId = null
    onOpenModal(`nav-modal`)
    const priceRange = getBookPricedRange()
    const elPriceInput = document.querySelector('.nav-modal [name=price]')
    document.querySelector('.price-label').innerText = `Price range: ${priceRange.min}$ - ${priceRange.max}$`
    elPriceInput.min = priceRange.min
    elPriceInput.max = priceRange.max
}

function onAddModal() {
    gCurrOpenModal.modal = 'add'
    gCurrOpenModal.bookId = null
    onOpenModal(`add-modal`)
}

function flashMsg(msg) {
    const elMsgModal = document.querySelector('.msg-modal')
    elMsgModal.innerText = msg
    elMsgModal.classList.add('show')
    setTimeout(() => elMsgModal.classList.remove('show'), 3000)
}

function onOpenModal(className) {
    document.querySelectorAll('.show').forEach(modal => {
        if (!modal.classList.contains(className) &&
            className !== 'msg-modal') modal.classList.remove('show')
    })
    document.querySelector(`.${className}`).classList.add('show')
    saveQueryStrParams()
}

function onCloseModal(className) {
    gCurrOpenModal.modal = null
    gCurrOpenModal.bookId = null
    document.querySelector(className).classList.remove('show')
    saveQueryStrParams()
}


function onUpdateBook(ev, elForm, bookId) {
    ev.preventDefault()
    const book = getBookById(bookId)
    const newPrice = +elForm.querySelector('[name=price]').value
    if (isNaN(newPrice) || newPrice <= 0) return flashMsg('Illegal price')
    const isOnSale = elForm.querySelector('[name=is-on-sale]').checked
    if (newPrice === book.price && book.isOnSale === isOnSale) return flashMsg('No appearant changes')
    else updateBook(bookId, newPrice, isOnSale)
    onCloseModal('.update-modal')
    flashMsg('Book updated successfully')
    gCurrViewState.renderAs(gCurrPage)
}

function onDeleteBook(bookId) {
    const bookName = deleteBook(bookId).name
    onCloseModal('.delete-modal')
    flashMsg(`Book ${bookName} deleted`)
    gCurrViewState.renderAs(gCurrPage)
}

function onCreateBook(ev, elForm) {
    ev.preventDefault()
    const bookName = elForm.querySelector('[name=name]').value
    const bookAuthor = elForm.querySelector('[name=author]').value
    const bookPrice = +elForm.querySelector('[name=price]').value
    const imgUrl = elForm.querySelector('[name=imgUrl]').value
    const isOnSale = elForm.querySelector('[name=isOnSale]').checked
    if (!bookName) return flashMsg('Illegal name')
    if (!bookAuthor) return flashMsg('Illegal author')
    if (isNaN(bookPrice) || bookPrice <= 0) return flashMsg('Illegal price')
    createBook(bookName, bookAuthor, bookPrice, imgUrl, isOnSale)
    flashMsg(`Book ${bookName} added successfully`)
    gCurrViewState.renderAs(gCurrPage)
    setTimeout(() => onCloseModal('.add-modal'), 2000)
}

function onFilter(elForm) {
    const txt = elForm.querySelector('[name=txt').value
    const maxPrice = +elForm.querySelector('[name=price').value
    const minRate = +elForm.querySelector('[name=rate').value
    setFilter({ txt, maxPrice, minRate })
    gCurrViewState.renderAs(gCurrPage)
}

function onSort() {
    const sortBy = document.querySelector('.sort-by').value
    const orderMultiplier = document.querySelector('.sort-reverse').checked ? -1 : 1
    setSort(sortBy, orderMultiplier)
    gCurrViewState.renderAs(gCurrPage)
}

function saveQueryStrParams() {
    const priceRange = getBookPricedRange()
    const txt = document.querySelector('.filter-by [name=txt]').value
    const maxPrice = document.querySelector('.filter-by  [name=price]').value
    const minRate = document.querySelector('.filter-by [name=rate]').value
    const sortBy = document.querySelector('.sort-by').value
    const orderMultiplier = document.querySelector('.sort-reverse').checked ? -1 : 1
    var queryStrParam = `?${gCurrViewState.renderAs === renderAsTable ? '' : `view=cards&page=${gCurrPage}&size=${pageSize}&`}`
    queryStrParam += `${txt ? '&txt=' : ''}${maxPrice < priceRange.max ? '&maxPrice=' + maxPrice : ''}${minRate > 0 ? '&minRate=' : ''}${sortBy ? '&sortBy=' : ''}`
    queryStrParam += `${orderMultiplier === -1 ? '&orderMultiplier=-1' : ''}`
    queryStrParam += `${gCurrOpenModal.modal ? `&modal=${gCurrOpenModal.modal}&id=${gCurrOpenModal.bookId}` : ''}`
    const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + queryStrParam
    window.history.pushState({ path: newUrl }, '', newUrl)
}

function renderByQueryStrParam() {
    const priceRange = getBookPricedRange()
    const queryStrParam = new URLSearchParams(window.location.search)
    const filterBy = {
        txt: '',
        maxPrice: priceRange.max,
        minRate: 0
    }
    const sortBy = {
        sortBy: '',
        orderMultiplier: 1
    }

    for (var prop in filterBy) {
        filterBy[prop] = queryStrParam.get(prop) || filterBy[prop]
        if (prop !== 'txt') filterBy[prop] = +filterBy[prop]
    }
    for (var prop in sortBy) {
        sortBy[prop] = queryStrParam.get(prop) || sortBy[prop]
        if (prop !== 'txt') sortBy[prop] = +sortBy[prop]
    }
    gCurrViewState.renderAs = (queryStrParam.get('view') !== 'cards') ? renderAsTable : renderAsCards
    if (queryStrParam.get('view') !== 'cards') document.querySelector('.table-view').classList.add('selected')
    else document.querySelector('.cards-view').classList.add('selected')
    gCurrPage = +queryStrParam.get('page') || 0
    pageSize = +queryStrParam.get('size') || 0
    onSetPageSize(pageSize)
    const currOpenModal = queryStrParam.get('modal')
    if (currOpenModal && currOpenModal !== 'undefined') {
        const bookId = queryStrParam.get('id')
        gModalObjectSwitch[currOpenModal](bookId)
    }
    document.querySelector('.sort-by').value = sortBy.sortBy
    document.querySelector('.sort-reverse').checked = sortBy.orderMultiplier
    document.querySelector('.filter-by [name=txt]').value = filterBy.txt
    document.querySelector('.filter-by  [name=price]').value = filterBy.maxPrice
    document.querySelector('.filter-by [name=rate]').value = filterBy.minRate

    setFilter(filterBy)
    setSort(sortBy.sortBy, sortBy.orderMultiplier)
}


function onSetPageSize(size) {
    if (isNaN(size) || size < 0) return
    pageSize = parseInt(size)
    setPageSize(size)
    gCurrViewState.renderAs()
}