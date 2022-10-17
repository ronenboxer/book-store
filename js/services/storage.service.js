'use strict'

function loadFromStorage(key) {
    const val = localStorage.getItem(key)
    return JSON.parse(val)
}

function saveToStorage(key, val) {
    localStorage.setItem(key, JSON.stringify(val))
}

function getPageNumsHtmlStr(currPageIdx, numOfPages, goToFunc) {
    var pageStr = ''
    if (numOfPages <= 1) return pageStr
    const firstPage = `<button class="page-index clickable" onclick="${goToFunc}(0)"><<</button>`
    const lastPage = `<button class="page-index clickable" onclick="${goToFunc}(${numOfPages-1})">>></button>`
    var i = currPageIdx > 0 ? currPageIdx - 1 : 0
    if (i > 0 && numOfPages >= 3) pageStr += firstPage
    for (i; i <= currPageIdx + 1 && i < numOfPages; i++) {
        if (i === currPageIdx) pageStr += `<button class="page-index curr-page">${i + 1}</button>`
        else pageStr += `<button class="page-index clickable" onclick="${goToFunc}(${i})">${i + 1}</button>`
    }
    if (i < numOfPages && numOfPages >= 3) pageStr += lastPage
    return pageStr
}
