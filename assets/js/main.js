const storageKey = "Bookshelf_Apps";
const books = [];
const bookSearch = [];
const webTitle = document.querySelector('.header-title');
const formInputBook = document.getElementById('inputBook');
const searchForm = document.getElementById('searchBook');
const searchKeyword = document.getElementById('searchKeyword');
const inputSection = document.querySelector('.input_section');
const inputTitle = document.getElementById('inputBookTitle');
const inputAuthor = document.getElementById('inputBookAuthor');
const inputYear = document.getElementById('inputBookYear');
const inputIsComplete = document.getElementById('inputBookIsComplete');
const searchButton = document.getElementById('searchButton')
const bukuBelumSelesaiDibaca = document.getElementById('incompleteBookshelfList');
const bukuSelesaiDibaca = document.getElementById('completeBookshelfList');
const notif = document.getElementById('flash-notif');

const checkWebStorage = () => {
  return typeof Storage !== "undefined";
};

document.addEventListener('DOMContentLoaded', () => {
  formInputBook.addEventListener('submit', (e) => {
    addBook();
    showNotif('Buku Berhasil Ditambahkan', 'success');
    e.preventDefault();
  })

  searchForm.addEventListener('submit', (ev) => {
    searching();
    ev.preventDefault();
  })

  webTitle.addEventListener('click', () => {
    location.reload();
  });
  if (checkWebStorage()) {
    getAllBook();
  }
})


const SHOW_EVENT = 'show-event';
const search_result = 'search-result';
const saved_event = 'saved-event';



const getAllBook = () => {
  let data = JSON.parse(localStorage.getItem(storageKey));

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(SHOW_EVENT));
}

const searching = () => {
  const searchResult = books.filter(book => book.title.toLowerCase() == searchKeyword.value.toLowerCase())
  showSearchResult(searchResult);
}

const showSearchResult = bookMatch => {
  inputSection.classList.add('hide');
  bukuBelumSelesaiDibaca.innerHTML = '';
  bukuSelesaiDibaca.innerHTML = '';
  for (const bookItem of bookMatch) {
    const bookElement = putBook(bookItem);
    if (!bookItem.isComplete) {
      bukuBelumSelesaiDibaca.append(bookElement);
    } else {
      bukuSelesaiDibaca.append(bookElement);
    }
  }
}



const setId = () => {
  return +new Date();
}



const addBook = () => {
  const id = setId();
  const title = inputTitle.value;
  const author = inputAuthor.value;
  const year = inputYear.value;
  const isComplete = inputIsComplete.checked;

  const bookData = {
    id,
    title,
    author,
    year,
    isComplete
  }
  books.push(bookData);
  formInputBook.reset();
  document.dispatchEvent(new Event(SHOW_EVENT));
  saveData();

}

const saveData = () => {
  if (checkWebStorage) {
    localStorage.setItem(storageKey, JSON.stringify(books));
    document.dispatchEvent(new Event(saved_event));
  }
}

document.addEventListener(saved_event, function() {
  console.log(localStorage.getItem(storageKey));
});

document.addEventListener(SHOW_EVENT, () => {
  searchForm.reset();
  inputSection.classList.remove('hide');
  bukuBelumSelesaiDibaca.innerHTML = '';
  bukuSelesaiDibaca.innerHTML = '';
  for (const bookItem of books) {
    const bookElement = putBook(bookItem);
    if (!bookItem.isComplete) {
      bukuBelumSelesaiDibaca.append(bookElement);
    } else {
      bukuSelesaiDibaca.append(bookElement);
    }
  }
})




const putBook = bookData => {
  const container = document.createElement('article');
  container.classList.add('book_item');
  container.setAttribute('id', `book-${bookData.id}`);

  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookData.title

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = bookData.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = 'Tahun Terbit: ' + bookData.year;

  const hapusButton = document.createElement('button');
  hapusButton.innerHTML = '<i class="fa fa-trash-alt"></i>';
  hapusButton.classList.add('delete');
  hapusButton.addEventListener('click', () => {
    Swal.fire({
      title: 'Apakah Anda Yakin Ingin Menghapus Buku ini?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      background: '#395B64',
      color: '#E7F6F2',
      confirmButtonColor: '#C72C41',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-1 right-gap',
        confirmButton: 'order-2 bg',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showNotif('Buku Telah Dihapus', 'danger');
        deleteBook(bookData.id);
      } else {
        return;
      }
    });
  })

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action');
  if (!bookData.isComplete) {
    const selesaiDibacaButton = document.createElement('button');
    selesaiDibacaButton.classList.add('move');
    selesaiDibacaButton.innerText = 'Selesai Dibaca';

    selesaiDibacaButton.addEventListener('click', () => {
      moveBookToCompleted(bookData.id);
      showNotif('Buku Dipindahkan ke Rak Buku Selesai Dibaca', 'warning');
    })

    actionContainer.append(selesaiDibacaButton, hapusButton);
  } else {
    const belumSelesaiDibacaButton = document.createElement('button');
    belumSelesaiDibacaButton.classList.add('move');
    belumSelesaiDibacaButton.innerText = 'Belum Selesai Dibaca';
    belumSelesaiDibacaButton.addEventListener('click', () => {
      moveBookToInCompleted(bookData.id);
      showNotif('Buku Dipindahkan ke Rak Buku Belum Selesai Dibaca', 'warning');
    })

    actionContainer.append(belumSelesaiDibacaButton, hapusButton);
  }

  container.append(bookTitle, bookAuthor, bookYear, actionContainer);

  return container;
}

const moveBookToCompleted = bookId => {
  const bookTarget = findBook(bookId);
  if (bookTarget === null) {
    return;
  }

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(SHOW_EVENT));
  saveData();
}

const moveBookToInCompleted = bookId => {
  const bookTarget = findBook(bookId);
  if (bookTarget === null) {
    return;
  }

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(SHOW_EVENT));
  saveData();
}


const deleteBook = bookId => {
  const bookTarget = books.findIndex(book => book.id === bookId);
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(SHOW_EVENT));
  saveData();

}
const findBook = bookId => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

const showNotif = (message, type) => {
  notif.classList.remove('hidden');
  const notifMessage = document.createElement('h4');
  notif.classList.add(type);
  notifMessage.classList.add('notif-text');
  notifMessage.innerText = message;

  notif.append(notifMessage);
  setTimeout(() => {
    notif.classList.add('hidden');
    notif.classList.remove(type);
    notif.innerHTML = '';
  }, 1500);
}