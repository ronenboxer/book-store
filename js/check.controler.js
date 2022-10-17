document.querySelector('.modal').addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget
    const bookId = button.dataset.modalId
    $('.modal-header').html(getModalHeader(bookId, 'VwzCsw'))
    $('.modal-body').html(getModalBody(bookId, 'VwzCsw'))
    $('.modal-footer').html(getModalFooter(bookId, 'VwzCsw'))

})

function getReadModalStr(bookId) {
    const book = getBookById(bookId)
    var str = ``
}

function getModalHeader(type, bookId = null) {
    const book = getBookById(bookId)
    var str = `<h1 class="modal-title fs-5" id="exampleModalLabel">`
    switch (type) {
        case 'read':
            str += `<span>${book.name}</span> <span>by ${book.author} | ${book.price} $`
            break
        case 'delete':
            str += `Delete '${book.name}'`
            break
        case 'add':
            str += 'Add a new book'
            break
        case 'update':
            str += `Edit book: '${book.name}'`
    }
    return str + `</span></h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`
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
            return `<form onsubmit=""> <input type="text" placeholder="book name"></input>
            <input type="text" placeholder="author"></input>
            <input type="text" placeholder="price">$</input>
            <div><button>-</button><span class="book-rating">0</span><button>+</button>
            <span> $gBookmarkIcon[1]}</span>
            <div><h6>book cover</h6>
            <label class="form-check-label" for="flexRadioDefault1">
            url
            <input class="form-check-input" type="radio" name="flexRadioDefault" checked>
            </label>
            <label class="form-check-label" for="flexRadioDefault2">
            upload
            <input class="form-check-input" type="radio" name="flexRadioDefault">
            </label>
            <label class="form-check-label" for="flexRadioDefault2">
            none
            <input class="form-check-input" type="radio" name="flexRadioDefault">
            </label>
            <div class="upload-method"></div>
            </div>`
    }
}

function getModalFooter(type, bookId){
    switch (type) {
        case 'read':
            return `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`
        default:
            return `<button type="button" class="cancel" data-book-id="${bookId}" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
                <button type="button" class="ok" data-book-id="${bookId}" data-bs-dismiss="modal" aria-label="Okay">Okay</button>`
        }
}