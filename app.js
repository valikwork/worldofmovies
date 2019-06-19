'use strict';

const $mainContent = document.querySelector('#content');

document.querySelector('#add-new').addEventListener('click', function() {
    location.hash = 'add-new';
});

function includeTemplate(tpl) {
    const template = _.template(tpl);
    const compile = template(tpl);
    $mainContent.innerHTML = compile;
};

let movieCollection = [];

function MOVIE(movieName, originalMovieName, movieYear, movieCountry, movieTagline, movieDirector, movieActors, movieIMDB, movieDescription, additionalPositions) {
    this.id = Date.now()
    this.movieName = movieName,
    this.originalMovieName = originalMovieName,
    this.movieYear = movieYear, 
    this.movieCountry = movieCountry, 
    this.movieTagline = movieTagline, 
    this.movieDirector = movieDirector, 
    this.movieActors = movieActors,
    this.movieIMDB = movieIMDB, 
    this.movieDescription = movieDescription,
    this.additionalPositions = additionalPositions
    // this.addMoviePos = addMoviePos || null,
    // this.addMoviePosName = addMoviePosName || null
};

function hashChanging() {

    if (location.hash === '#add-new') {
        postModal();
    };
};

async function postModal() {
    const response = await fetch('add-new.html');
    const data = await response.text();
    let modalWrap = await document.createElement('div');
    modalWrap.innerHTML = data;
    $mainContent.appendChild(modalWrap);
    $('#Modal').modal('show');

    await document.querySelector('#closeModal').addEventListener('click', function() {
        location.hash = '';
        $('#Modal').modal('hide');
        modalWrap.remove()
    });

    await document.querySelector('#cancelModal').addEventListener('click', function() {
        location.hash = '';
        $('#Modal').modal('hide');
        modalWrap.remove()
    });

    await document.querySelector('.modal-content').addEventListener('click', function(e) {
        const el = e.target;
        const modalForm = document.querySelector('#modalForm');
        
        let addField = document.createElement('div')
        addField.setAttribute('class','add-field form-group row');
        addField.innerHTML = `<div class="col-sm-5">
               <input type="text" name="add-position" class="form-control add-position" placeholder="Должность">
             </div>
             <div class="col-sm-5">
               <input type="text" name="add-name" class="form-control add-name" placeholder="Имя">
             </div>
             <div class="col-sm-2">
               <button class="btn btn-danger btn-sm btn-remove-field" id='removeField' type="button"><svg class="octicon octicon-x" viewBox="0 0 14 18" version="1.1" width="14" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg></button>
             </div>`
        if (el.id === 'addField') {
            document.querySelector('#fieldset').appendChild(addField);
        };
        if (el.id === 'removeField') {
            el.parentElement.parentElement.remove()
        };
        if (el.id === 'saveModal') {
            let movieName = modalForm.elements['movie-name'].value;
            let originalMovieName = modalForm.elements['original-movie-name'].value;
            let movieYear = modalForm.elements['year'].value;
            let movieCountry = modalForm.elements['country'].value;
            let movieTagline = modalForm.elements['tagline'].value;
            let movieDirector = modalForm.elements['director'].value;
            let movieActors = modalForm.elements['actors'].value.split(',');
            let movieIMDB = modalForm.elements['imdb'].value;
            let movieDescription = modalForm.elements['description'].value;
            let moviePoster = modalForm.elements['poster']; ////??????

            let additionalPositions = [];
            // console.dir(moviePoster)
            if (modalForm.elements['add-position'] && modalForm.elements['add-name']) {
                
                this.querySelectorAll('.add-field').forEach(function(field) {
                    let keys = {};
                    let pos = field.querySelector('.add-position').value;
                    let name = field.querySelector('.add-name').value;
                    Object.defineProperty(keys, pos, {
                        value: name
                    });
                    additionalPositions.push(keys)
                });
            };

            let newMovie = new MOVIE(movieName, originalMovieName, movieYear, movieCountry, 
                                    movieTagline, movieDirector, movieActors, movieIMDB, 
                                    movieDescription, additionalPositions);

            movieCollection.push(newMovie);
            console.log(movieCollection);
            saveToLocal(movieCollection)
        };
    });
}

function saveToLocal(file) {
    localStorage.setItem('movie', JSON.stringify(file));
};

window.addEventListener("hashchange", () => hashChanging());

