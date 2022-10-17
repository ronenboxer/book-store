'use strict'

var gCurrLang = 'en'
var gAvailableLangs = ['en','he']

const gTrans = {
    'nav-view': {
        en: 'VIEW',
        he: 'תצוגה'
    },
    'nav-sort': {
        en: 'SORT',
        he: ' מיון',
    },
    'sort-direction' :{
        en: 'direction',
        he :'כיוון'
    },
    'sort-default' :{
        en: 'default',
        he :'ברירת מחדל'
    },
    'sort-id': {
        en:'id',
        he:'מזהה'
    },
    'sort-price': {
        en:'price',
        he:'מחיר'
    },
    'sort-rating' :{
        en: 'rating',
        he:'דירוג'
    },
    'sort-name': {
        en: 'name',
        he: 'שם'
    },
    'sort-author': {
        en: 'author',
        he:'סופר/ת'
    },
    'nav-filter':{
        en: 'FILTER',
        he :'סינון'
    },
    'filter-price': {
        en:' price',
        he:'מחיר'
    },
    'filter-rating':{
        en: 'rating',
        he: 'דירוג'
    },
    'filter-bookmark': {
        en:'bookmark',
        he: 'מועדף'
    },
    'nav-add': {
        en: 'ADD',
        he: 'הוספה'
    },
    'header-slogen': {
        en: `LET'S SELL THEM BOOKS!`,
        he: `בואו נמכור כמה ספרים!`
    },
    'header-lorem': {
        en: 'Lorem',
        he :'לורם'
    },
    'header-ipsum': {
        en:' Ipsum',
        he :'איפסום'
    },
    'table-id': {
        en:'id',
        he:'מזהה'
    },
    'table-name':{
        en:'TITLE',
        he:'שם'
    },
    'table-author':{
        en:'AUTHOR',
        he:'סופר/ת'
    },
    'table-price':{
        en:'PRICE',
        he:'מחיר'
    },
    'table-rating':{
        en:'RATING',
        he:'דירוג'
    },
    'table-actions':{
        en:'ACTIONS',
        he :'פעולות'
    }
}

function setLang(lang){
    if (!lang || !gAvailableLangs.includes(lang)) return
    gCurrLang = lang
}

function getTrans(transKey){
    const transMap = gTrans[transKey]
    if (!transMap) return 'UNKOWN'
    let trans = transMap[gCurrLang]
    if (!trans) trans = transMap['en']
    return trans
}

function doTrans(){
    $('[data-trans]').text(function (){
        return getTrans(this.dataset.trans)
    })
    const textDirection = new Intl.Locale(gCurrLang).textInfo.direction
    if (textDirection === 'rtl') $('body').addClass('rtl')
    else $('body').removeClass('rtl')
}

function formatNum(num){
    return new Intl.NumberFormat(gCurrLang).format(num)
}