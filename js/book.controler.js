'use strict'

const CLOSE_ICON = '<iconify-icon inline icon="carbon:close-filled"></iconify-icon>'
var gRenderAs = renderAsTable
var gCurrViewMode = 'table'
var gCurrPage = 0
var gCurrMenu = null
const gCurrOpenModal = {}
const gModalObjectSwitch = {
    add: () => onAddModal(),
    read: bookId => onReadModal(bookId),
    update: bookId => onUpdateModal(bookId),
    nav: () => onNavModal(),
    delete: bookId => onDeleteModal(bookId)
}
const gBookmarkIcons = {
    false: '<iconify-icon inline icon="clarity:heart-line"></iconify-icon>',
    true: '<iconify-icon inline icon="clarity:heart-solid"></iconify-icon>'
}
var pageSize = 0

const HEART_ICON = '<iconify-icon width="1.5rem" inline icon="ci:heart-fill"></iconify-icon>'
const READ_ICON = '<iconify-icon width="1.5rem" inline icon="akar-icons:book"></iconify-icon>'
const UPDATE_ICON = '<iconify-icon width="1.5rem" inline icon="arcticons:oxygenupdater"></iconify-icon>'
const DELETE_ICON = '<iconify-icon width="1.5rem" inline icon="bytesize:trash"></iconify-icon>'
var header = document.querySelector('header');

$(document).ready(onInit)

function fadeOutOnScroll(element) {
    if (!element) {
        return;
    }

    var distanceToTop = window.pageYOffset + element.getBoundingClientRect().top;
    var elementHeight = element.offsetHeight;
    var scrollTop = document.documentElement.scrollTop * 1.3;

    var opacity = 1;

    if (scrollTop > distanceToTop) {
        opacity = 1 - (scrollTop - distanceToTop) / elementHeight;
    }

    if (opacity >= 0) {
        element.style.opacity = opacity;
    }
}

function scrollHandler() {
    fadeOutOnScroll(header);
}


function onInit() {
    document.querySelector('header iconify-icon').classList.add('show')
    setTimeout(() => document.querySelector('.headings-container').classList.add('show'), 600);
    const priceRange = getBookPricedRange()
    renderByQueryStrParam()
    addEventListeners()
}

function addEventListeners() {

    window.addEventListener('scroll', scrollHandler)
    document.querySelectorAll('.view iconify-icon').forEach(view => {
        view.addEventListener('click', () => switchViewMode(view.parentElement.dataset.name))
    })
    document.querySelectorAll('.sort .dropdown-item').forEach(elMeunCat => elMeunCat.addEventListener('click', () => {
        const sortKey = elMeunCat.dataset.sortBy
        var sortBy
        if (+sortKey === 1 || +sortKey === -1) {
            sortBy = { orderMultiplier: -(+sortKey) }
            const sortIcon = document.querySelector('.sort-direction iconify-icon')
            sortIcon.classList.toggle('up')
            sortIcon.classList.toggle('down')
        } else sortBy = { sortBy: sortKey }
        onSort(sortBy)
    }))
    document.querySelectorAll('input.input-range').forEach(elInputRange => {
        elInputRange.addEventListener('input', () => rangeSlide(elInputRange))
    })
    document.querySelector('.filter-form').addEventListener('submit', (event) => event.preventDefault())
    $('.filter-form').on('input', function () {
        onFilter(this)
    })
    $('.filter-form button.is-bookmarked').on('click', function (event) {
        toggleBookmark(this)
        onFilter()
    })
    document.querySelector('.language-set .he').addEventListener('click', () => onSetLanguage('he'))
    document.querySelector('.language-set .en').addEventListener('click', () => onSetLanguage('en'))

    document.querySelector('.modal').addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget
        const modalName = button.dataset.modalName
        const bookId = button.dataset.bookId
        const elModal = document.querySelector('.modal')
        const elModalHeader = elModal.querySelector('.modal-header')
        const elModalBody = elModal.querySelector('.modal-body')
        const elModalFooter = elModal.querySelector('.modal-footer')
        elModalHeader.innerHTML = getModalHeader(modalName, bookId)
        elModalBody.innerHTML = getModalBody(modalName, bookId)
        elModalFooter.innerHTML = getModalFooter(modalName, bookId)
        elModal.dataset.modalName = modalName
        // elModal.querySelectorAll('.modal-footer .rating-btn').forEach(btn => {
        //     const nextRate = +btn.dataset.nextRate
        //     const bookId = btn.dataset.bookId
        //     btn.addEventListener('click', (event) => {
        //         event.preventDefault()
        //         onChangeRate(bookId, nextRate, modalName)
        //     })
        // })
        const elBookmarkBtn = elModal.querySelector('button.is-bookmarked')
        elModal.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', () => onChangeRate(bookId, +btn.dataset.nextRate, modalName))
        })
        if (modalName === 'update' || modalName === 'add') {
            elModalBody.querySelector('form').addEventListener('submit', (event) => event.preventDefault())
            elBookmarkBtn.addEventListener('click', () => {
                toggleBookmark(elBookmarkBtn)
            })
        }
        if (modalName === 'read') {
            elBookmarkBtn.addEventListener('click', () => {
                toggleBookmark(elBookmarkBtn)
                toggleBookmark(document.querySelector(`.main-content [data-book-id="${bookId}"] .is-bookmarked`))
                const isBookmarked = elBookmarkBtn.dataset.isBookmarked === 'false' ? false : true
                updateBook(bookId, { isBookmarked })
            })
        } else if (modalName === 'update') {
            elModalFooter.querySelector('button.ok').addEventListener('click', () => {
                onUpdateBook(event, bookId)
                gRenderAs()
            })
        } else if (modalName === 'delete') {
            elModalFooter.querySelector('button.ok').addEventListener('click', () => {
                deleteBook(bookId)
                gRenderAs()
            })
        } else if (modalName === 'add') {
            elModalFooter.querySelector('button.ok').addEventListener('click', () => {
                onCreateBook()
                gRenderAs()
            })
        }
    })
    $('a.nav-link').on('click', function () {
        closeMenus(this)
    })
}

function getModalHeader(type, bookId = null) {
    const book = getBookById(bookId)
    var str = `<h3>`
    switch (type) {
        case 'read':
            str += `${book.name}</h1><h3>${book.author} | <span>${book.price} $</span></h3>`
            break
        case 'delete':
            str += `Delete <span>'${book.name}'</span></h1>`
            break
        case 'add':
            str += 'Add a new book</h1>'
            break
        case 'update':
            str += `Edit book: '${book.name}'</h3>`
    }
    return str + `<button type="button" class="btn-close-modal" data-bs-dismiss="modal" aria-label="Close">X</button>`
}

function getModalBody(type, bookId = null) {
    const book = getBookById(bookId)
    switch (type) {
        case 'read':
            return `<img src="${book.imgUrl}" onerror="this.src='imgs/book-covers/unkown.png'"><p>${book.about}</p>`
        case 'delete':
            return `<p>Are you sure you want to delete this book?</p>`
        case 'add':
        case 'update':
            const isBookmarked = type === 'update' ? book.isBookmarked : false
            return `<form class="${type}-form" onsubmit=""> 
                <div class="${type}-flex" style="display:flex; flex-direction:column;">
                    <input name="name" type="text" placeholder="book name">
                    <input name="author" type="text" placeholder="author">
                    <input name="price" type="text" placeholder="price">
                    </div>
                    <div class="${type}-flex" style="display:flex; flex-direction:column;">
                    <button class="is-bookmarked" data-is-bookmarked="${isBookmarked}"> ${gBookmarkIcons[isBookmarked]}</button>
                    <input name="url" type="url" placeholder="book cover url (optional)">
                    <div class="book-rating-container"><button class="rating-btn" data-next-rate="-1"${type === 'update' ? `data-book-id="${bookId}"` : ''}>-</button>
                    <span class="book-rating">${type === 'update' ? book.rate : 5}</span>
                    <button class="rating-btn" data-next-rate="1" ${type === 'update' ? `data-book-id="${bookId}"` : ''}>+</button></div>
                </div>
            </form>`
    }
}

function getModalFooter(type, bookId) {
    switch (type) {
        case 'read':
            const book = getBookById(bookId)
            return `<div class="book-rating-container"><button class="rating-btn" data-next-rate="-1" data-book-id="${bookId}">-</button>
            <span class="book-rating">${book.rate}</span>
            <button class="rating-btn" data-next-rate="1" data-book-id="${bookId}">+</button></div>
            <button class="is-bookmarked" data-book-id="${book.id}" data-is-bookmarked="${book.isBookmarked}"> ${gBookmarkIcons[book.isBookmarked]}</button>`
        default:
            return `<button type="button" class="cancel" data-book-id="${bookId}" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
                <button type="button" class="ok" data-book-id="${bookId}" data-bs-dismiss="modal" aria-label="Okay">Okay</button>`
    }
}

function renderAsTable() {
    const books = getFilteredBooks()
    const elContainer = document.querySelector('.books-container')
    elContainer.classList.remove('flex')
    elContainer.innerHTML = `<table class="table table-striped" style="border-collapse: separate;">
    <thead>
    <tr>
        <th data-trans="table-id">${getTrans('table-id')}</th>
        <th data-trans="table-name">${getTrans('table-name')}</th>
        <th data-trans="table-author">${getTrans('author')}</th>
        <th data-trans="table-price">${getTrans('table-price')}</th>
        <th>${gBookmarkIcons.true}</th>
        <th data-trans="table-rating">${getTrans('table-rating')}</th>
        <th colspan="3" data-trans="table-actions">${getTrans('table-actions')}</th>
    </tr>
        </thead>
        <tbody></tbody>
    </table>`
    const HTMLs = books.map(book => `
    <tr data-book-id="${book.id}">
        <td>${book.id}</td>
        <td>${book.name}</td>
        <td>${book.author}</td>
        <td>${book.price}$</td>
        <td class="is-bookmarked" data-is-bookmarked="${book.isBookmarked}">${book.isBookmarked ? gBookmarkIcons.true : gBookmarkIcons.false}</td>
        <td class="book-rating">${book.rate}</td>
        <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal"
        data-modal-name="read" data-book-id="${book.id}">${READ_ICON}</button></td>
        <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal"
        data-modal-name="update" data-book-id="${book.id}">${UPDATE_ICON}</button></td>
        <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal"
        data-modal-name="delete" data-book-id="${book.id}">${DELETE_ICON}</button></td>
    </tr>`)
    document.querySelector('tbody').innerHTML = HTMLs.join('')
    document.querySelectorAll('.pages-container').forEach(page => page.innerHTML = '')
    document.querySelectorAll('.page-sizing').forEach(page => page.innerHTML = '')

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
        return `<article class="${book.id} card" data-id="${book.id}" data-img-url="${book.imgUrl}">
            <div class="content">
                <h2>${book.name}</h2>
                <h3>by ${book.author}</h3>
                <p class="copy">${book.about}</p>
            <div class="actions">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal"
            data-modal-name="update" data-book-id="${book.id}">${UPDATE_ICON}</button>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal"
            data-modal-name="delete" data-book-id="${book.id}">${DELETE_ICON}</button>
            </div>
        </article>`
    }).join('')

    var styleStr = document.createElement('style')
    styleStr.textContent = ''
    document.querySelectorAll('.card').forEach(card => {
        styleStr.textContent += `.card.${card.classList.value.split(' ')[0]}::before {
            background-image: url('${card.dataset.imgUrl}');
        }\n`
    })
    document.querySelector('head').appendChild(styleStr)
    const pagesHtmlStr = getPageNumsHtmlStr(pageIdx, numOfPages, 'renderAsCards')
    document.querySelectorAll('.pages-container').forEach(container => container.innerHTML = pagesHtmlStr)
    document.querySelectorAll('.view-per-page').forEach(section => section.innerHTML = `<span>books per page</span>
    <button data-size="1" onclick="onSetPageSize(1)">1</button> | 
    <button data-size="2" onclick="onSetPageSize(2)">2</button> | 
    <button data-size="5" onclick="onSetPageSize(5)">5</button> | 
    <button data-size="10" onclick="onSetPageSize(10)">10</button> | 
    <button data-size="infinity" onclick="onSetPageSize(0)">infinity</button> `)
    saveQueryStrParams()
}

function renderAsCarousel() {

}

function switchViewMode(viewMode = gCurrViewMode) {
    const priceRange = getBookPricedRange()
    const elPriceInput = document.querySelector('.price-range input')
    elPriceInput.min = priceRange.min
    elPriceInput.max = priceRange.max
    document.querySelectorAll('.view .dropdown-item').forEach(view => {
        if (view.dataset.name === viewMode) view.classList.add('checked')
        else view.classList.remove('checked')
    })
    switch (viewMode) {
        case 'table': gRenderAs = renderAsTable
            break
        case 'cards': gRenderAs = renderAsCards
            break
        default: gRenderAs = renderAsCarousel
    }
    gCurrViewMode = viewMode
    gRenderAs()
}

function onChangeRate(bookId, nextRate, modalName) {
    var book
    var newRate
    if (bookId) {
        book = getBookById(bookId)
        newRate = +book.rate + nextRate
    } else newRate = +document.querySelector(`[data-modal-name="add"] .book-rating`).innerText + nextRate
    if (newRate === -1 || newRate === 11) return
    document.querySelector(`.${modalName === 'read' ? 'modal-footer' : 'update-form'} .book-rating`).innerText = +newRate
    if (modalName === 'read') document.querySelector(`.main-content [data-book-id="${bookId}"] .book-rating`).innerText = +newRate
    else if (modalName === 'update') document.querySelector('.modal-body .book-rating').innerText = +newRate
}

// function flashMsg(msg) {
//     const elMsgModal = document.querySelector('.msg-modal')
//     elMsgModal.innerText = msg
//     elMsgModal.classList.add('show')
//     setTimeout(() => elMsgModal.classList.remove('show'), 3000)
// }

function onUpdateBook(ev, bookId) {
    ev.preventDefault()
    const elForm = document.querySelector('form.update-form')
    const name = elForm.querySelector('[name="name"]').value.trim()
    const author = elForm.querySelector('[name="author"]').value.trim()
    const price = +elForm.querySelector('[name="price"]').value.trim() || -1
    const url = elForm.querySelector('[name="url"]').value.trim()
    const isBookmarked = elForm.querySelector('button.is-bookmarked').dataset.isBookmarked === 'false' ? false : true
    const rate = +elForm.querySelector('.book-rating').innerText
    updateBook(bookId, { name, author, price, url, isBookmarked, rate })
}

function onCreateBook() {
    const elForm = document.querySelector('.add-form')
    const name = elForm.querySelector('[name="name"]').value.trim()
    if (!name) return
    const author = elForm.querySelector('[name="author"]').value.trim()
    if (!author) return
    const price = +elForm.querySelector('[name="price"]').value.trim() || -1
    if (isNaN(price) || price <= 0) return
    const url = elForm.querySelector('[name="url"]').value.trim()
    const isBookmarked = elForm.querySelector('button.is-bookmarked').dataset.isBookmarked === 'false' ? false : true
    const rate = +elForm.querySelector('.book-rating').innerText
    createBook({ name, author, price, url, isBookmarked, rate })
}

function onFilter() {
    const elForm = document.querySelector('.filter-form')
    const txt = elForm.querySelector('input.input-text').value
    const maxPrice = +elForm.querySelector('input[data-id="max-price"]').value
    const minRate = +elForm.querySelector('input[data-id="min-rate"]').value
    const isBookmarked = elForm.querySelector('button.is-bookmarked').dataset.isBookmarked === 'false' ? false : true
    setFilter({ txt, maxPrice, minRate, isBookmarked })
    saveQueryStrParams()
    gRenderAs(gCurrPage)
}

function onSort(sortBy) {
    if (sortBy.sortBy !== undefined) document.querySelector('.sort').dataset.sortBy = sortBy.sortBy
    if (sortBy.orderMultiplier !== undefined) document.querySelector('[data-sort-id="direction"]').dataset.sortBy = sortBy.orderMultiplier
    setSort(sortBy)
    saveQueryStrParams()
    gRenderAs(gCurrPage)
}

function toggleBookmark(elBookmark) {
    const newBookmarkData = elBookmark.dataset.isBookmarked === 'false' ? true : false
    elBookmark.dataset.isBookmarked = newBookmarkData
    elBookmark.innerHTML = gBookmarkIcons[newBookmarkData]
    if (elBookmark.localName !== 'button') return
    if (newBookmarkData) elBookmark.classList.add('checked')
    else elBookmark.classList.remove('checked')
}


function saveQueryStrParams() {
    const priceRange = getBookPricedRange()
    const txt = document.querySelector('.filter .input-text').value
    const maxPrice = document.querySelector('.filter  .input-range[data-id="max-price"]').value
    const minRate = document.querySelector('.filter .input-range[data-id="min-rate"]').value
    const isBookmarked = document.querySelector('.filter-form button.is-bookmarked').dataset.isBookmarked === 'false' ? false : true
    const sortBy = document.querySelector('.sort').dataset.sortBy
    const orderMultiplier = +document.querySelector('[data-sort-id="direction"]').dataset.sortBy
    var queryStrParam = `?view=${gRenderAs === renderAsTable ? 'table' : `cards&page=${gCurrPage}&size=${pageSize}&`}`
    queryStrParam += `${txt ? '&txt=' : ''}&isBookmarked=${isBookmarked}`
    queryStrParam += `${maxPrice < priceRange.max ? '&maxPrice=' + maxPrice : ''}${minRate > priceRange.min ? '&minRate=' : ''}`
    queryStrParam += `${sortBy ? `&sortBy=${sortBy}` : ''}&orderMultiplier=${orderMultiplier}`
    // queryStrParam += `${gCurrOpenModal.modal ? `&modal=${gCurrOpenModal.modal}&id=${gCurrOpenModal.bookId}` : ''}`
    const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + queryStrParam
    window.history.pushState({ path: newUrl }, '', newUrl)
    // var queryStrParam = `?${gRenderAs === renderAsTable ? '' : `view=cards&page=${gCurrPage}&size=${pageSize}&`}`
    // queryStrParam += `${txt ? '&txt=' : ''}${maxPrice < priceRange.max ? '&maxPrice=' + maxPrice : ''}${minRate > 0 ? '&minRate=' : ''}${sortBy ? '&sortBy=' : ''}`
    // queryStrParam += `${orderMultiplier === -1 ? '&orderMultiplier=-1' : ''}`
    // queryStrParam += `${gCurrOpenModal.modal ? `&modal=${gCurrOpenModal.modal}&id=${gCurrOpenModal.bookId}` : ''}`
    // const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + queryStrParam
    // window.history.pushState({ path: newUrl }, '', newUrl)
}

function renderByQueryStrParam() {
    const priceRange = getBookPricedRange()
    const queryStrParam = new URLSearchParams(window.location.search)
    const filterBy = {
        txt: '',
        maxPrice: priceRange.max,
        minRate: 0,
        isBookmarked: false
    }
    const sortBy = {
        sortBy: '',
        orderMultiplier: 1
    }

    for (var prop in filterBy) {
        const currKey = queryStrParam.get(prop)
        if (prop === 'isBookmarked') {
            if (!currKey || currKey === '' || currKey === 'false' || currKey !== 'true') filterBy[prop] = false
            else filterBy[prop] = true
        } else if (!currKey || currKey === '') continue
        gFilter[prop] = currKey
    }
    for (var prop in sortBy) {
        const currKey = queryStrParam.get(prop)
        if (currKey === null || currKey === '') continue
        sortBy[prop] = queryStrParam.get(prop) || sortBy[prop]
        sortBy[prop] = isNaN(sortBy[prop]) ? sortBy[prop] : +sortBy[prop]
    }
    const currViewMode = queryStrParam.get('view')
    gCurrViewMode = currViewMode === 'cards' ? 'cards' : currViewMode === 'carousel' ? 'carousel' : 'table'
    document.querySelector(`.dropdown-item[data-name="${gCurrViewMode}"]`).classList.add('checked')

    const elPriceInput = document.querySelector('.price-range input')
    $('.price-range .input-value').text(priceRange.max)
    elPriceInput.min = priceRange.min
    elPriceInput.max = priceRange.max
    elPriceInput.value = priceRange.max
    document.querySelector('.sort').dataset.sortBy = sortBy.sortBy
    document.querySelector('[data-sort-id="direction"]').dataset.sortBy = sortBy.orderMultiplier
    elPriceInput.value = filterBy.maxPrice
    document.querySelector('.filter .input-range[data-id="min-rate"]').value = filterBy.minRate
    document.querySelector('.filter .input-text[data-id="txt"]').value = filterBy.txt
    document.querySelector('.filter .is-bookmarked').dataset.isBookmarked = filterBy.isBookmarked
    document.querySelector('.filter .is-bookmarked').innerHTML = gBookmarkIcons[filterBy.isBookmarked]

    setFilter(filterBy)
    setSort(sortBy.sortBy, sortBy.orderMultiplier)
    gCurrPage = +queryStrParam.get('page') || 0
    pageSize = +queryStrParam.get('size') || 0
    onSetPageSize(pageSize)
}


function onSetPageSize(size) {
    if (isNaN(size) || size < 0) return
    pageSize = parseInt(size)
    setPageSize(size)
    switchViewMode()
}

function rangeSlide(elInput) {
    $(elInput).parent().parent().find('span').text(+elInput.value)
}

function onSetLanguage(lang) {
    setLang(lang)
    doTrans()
}

function closeMenus(elLeaveOpenMenu = null) {
    const currMenuClass = elLeaveOpenMenu.className
    document.querySelectorAll('.menu.nav-item').forEach(li => {
        if (!elLeaveOpenMenu || li.querySelector('a.nav-link').className !== currMenuClass) {
            li.querySelector('.nav-item').classList.remove('show')
        }
    })
}

