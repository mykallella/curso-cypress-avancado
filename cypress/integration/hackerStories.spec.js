describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  /** CONTEXTO - DIRETO NA API */
  context('Hitting the real API', () => {
    beforeEach(() => {
        
      /** PRIMEIRO - procuro o Looading */
  
      // cy.visit('/')
      // cy.assertLoadingIsShownAndHidden()
      // cy.contains('More').should('be.visible') 
      
  
      /** SEGUNDO - direto requisição para o backend */    
  
      // cy.intercept(
      //   'GET',
      //   '**/search?query=React&page=0'
      // ).as('getStories')
  
      // cy.visit('/')
      // cy.wait('@getStories') 
  
  
      /** TERCEIRO - direto requisição para o backend (usando OBJETO) */
  
      cy.intercept({
        method: 'GET',
        pathname: '**/search', // ao clicar no botão 'search' o caminho é esse
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')
  
      cy.visit('/') // acesso a página principal
      cy.wait('@getStories') // espero a resiquição
  
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {

      /** PRIMEIRO - procuro o Looading */

      // cy.get('.item').should('have.length', 20)
      // cy.contains('More').click()
      // cy.assertLoadingIsShownAndHidden()
      // cy.get('.item').should('have.length', 40)


      //* SEGUNDO - direto requisição para o backend */
      
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStories')

      cy.get('.item').should('have.length', 20)
      cy.contains('More').click()       
      cy.wait('@getNextStories')
      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`
      ).as('getNewTermStories')

      cy.get('#search')
        .clear()      
        .type(`${newTerm}{enter}`)

      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@getNewTermStories') // espera a requisição

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      // cy.assertLoadingIsShownAndHidden()
      cy.wait('@getStories') // espera a requisição
      
      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })

  })

  /** CONTEXTO - MOCKANDO A API */
  context('Mocking the API', () => {

    /** CONTEXTO - FOOTER AND LIST OF STORIES */
    context('Footer and list of stories', () => {

      beforeEach(() => {    
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' } // usa a fixture 'stories.json' (simulando a API)
        ).as('getStories')
    
        cy.visit('/') // acesso a página principal
        cy.wait('@getStories') // espero a resiquição
      })
    
      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })
    
    
      /** CONTEXTO -  LIST OF STORIES */
      context('List of stories', () => {

        it.only('shows the right data for all rendered stories', () => {
          const stories = require('../fixtures/stories') // só inseri os dados da fixture stories na variável 'stories'

          cy.get('.item')
            .first() // pega o primeiro
            .should('contain', stories.hits[0].title) 
            // verifica se contém o título do primeiro item
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            // pega o item que contém um link com o título do primeiro item
            .should('have.attr', 'href', stories.hits[0].url)  
            // verifica se o atributo href desse link tem a url do primeiro item  

          cy.get('.item')
            .last() // pega o último
            .should('contain', stories.hits[1].title) 
            // verifica se contém o título do segundo item
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
          // pega o item que contém um link com o título do segundo item
            .should('have.attr', 'href', stories.hits[1].url)
            // verifica se o atributo href desse link tem a url do segundo item  
        })
        
    
        it('shows one less stories after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .click()
    
          cy.get('.item').should('have.length', 1)
        })
    
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context.skip('Order by', () => {
          it('orders by title', () => {})
    
          it('orders by author', () => {})
    
          it('orders by comments', () => {})
    
          it('orders by points', () => {})
        })
      })
  
    })
 
    /** CONTEXTO - SEARCH */
    context('Search', () => {
  
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'empty' }
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')
  
        cy.get('#search')
          .clear()
      })
  
      it('types and hits ENTER', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)
  
        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories') // espera a requisição
  
        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      it('types and clicks the submit button', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()
  
        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories') // espera a requisição
  
        cy.get('.item').should('have.length', 2)        
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      // it.only('types and submits the form directly', () => {
      //   cy.get('#search').type(newTerm)
      //   cy.get('form').submit()
      //   cy.wait('@getNewTermStories') // espera a requisição
      //   cy.get('.item').should('have.length', 20)
      // })
  
      /** CONTEXTO - SEARCH >> LAST SEARCHES */
      context('Last searches', () => {        
  
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')
  
          cy.intercept(
            'GET',
            '**/search**', // ao clicar em search e enviar qualquer palavra aleatória o caminho é esse
            { fixture: 'empty' }
          ).as('getRandomStories')
  
          Cypress._.times(6, () => { // executa 6 vezes
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@getRandomStories') // espera a requisição
          })
  
          // cy.assertLoadingIsShownAndHidden()
  
          cy.get('.last-searches button')
            .should('have.length', 5)
        })
      })
    })
  })

})


// SIMULANDO ERROS
context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**', // ao clicar em search e enviar qualquer palavra o caminho é esse
      { statusCode: 500 } // retorna erro
    ).as('getServerFailure')

    cy.visit('/')
    cy.wait('@getServerFailure') // espera a requisição
    cy.get('p:contains(Something went wrong ...)').should('be.visible') 
    // verifica que a frase está visível no parágrafo
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**', // ao clicar em search e enviar qualquer palavra o caminho é esse
      { forceNetworkError: true } // retorna erro
    ).as('getNetworkFailure')

    cy.visit('/')
    cy.wait('@getNetworkFailure') // espera a requisição
    cy.get('p:contains(Something went wrong ...)').should('be.visible') 
    // verifica que a frase está visível no parágrafo
  })
})

