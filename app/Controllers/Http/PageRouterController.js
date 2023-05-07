'use strict'

const Env = use('Env')

const pageConfig = {
  terms: true
}
class PageRouterController {

  async pageRender({ request, view, response }) {
    try{
      // Check the valid game request url and remove the slash at the end
      let url = request.url()
      if(url.endsWith('/')){
        url = url.slice(0, -1)
      }

      const path = url.split('/').pop()
      const xummkey =  Env.get('XUMM_APIKEY')

      if(!path){
        return view.render('home', { xummkey: xummkey})
      }
      else if(pageConfig[path]){
        return view.render(path, { xummkey: xummkey})
      }
      else{
        return view.render('404')
      }
    }
    catch ( error ) {
      return view.render('404')
    }
  }
}

module.exports = PageRouterController
