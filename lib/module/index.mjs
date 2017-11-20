import 'core-js/modules/es6.object.assign'
import _typeof from '@babel/runtime/helpers/typeof'
import { ApolloLink, Observable } from 'apollo-link'
import { print } from 'graphql/language/printer'
import { extractFiles } from 'extract-files'
export { ReactNativeFile } from 'extract-files'
var root =
  ((typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object' &&
    self.self === self &&
    self) ||
  ((typeof global === 'undefined' ? 'undefined' : _typeof(global)) ===
    'object' &&
    global.global === global &&
    global) ||
  this
export var createUploadLink = function createUploadLink() {
  var _ref =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    includeExtensions = _ref.includeExtensions,
    _ref$uri = _ref.uri,
    linkUri = _ref$uri === void 0 ? '/graphql' : _ref$uri,
    linkCredentials = _ref.credentials,
    linkHeaders = _ref.headers,
    _ref$fetchOptions = _ref.fetchOptions,
    linkFetchOptions = _ref$fetchOptions === void 0 ? {} : _ref$fetchOptions,
    _ref$fetch = _ref.fetch,
    linkFetch = _ref$fetch === void 0 ? root.fetch : _ref$fetch

  return new ApolloLink(function(_ref2) {
    var operationName = _ref2.operationName,
      variables = _ref2.variables,
      query = _ref2.query,
      extensions = _ref2.extensions,
      getContext = _ref2.getContext,
      setContext = _ref2.setContext
    return new Observable(function(observer) {
      var requestOperation = {
        query: print(query)
      }
      if (operationName) requestOperation.operationName = operationName
      if (Object.keys(variables).length) requestOperation.variables = variables
      if (extensions && includeExtensions)
        requestOperation.extensions = extensions
      var files = extractFiles(requestOperation)

      var _getContext = getContext(),
        _getContext$uri = _getContext.uri,
        uri = _getContext$uri === void 0 ? linkUri : _getContext$uri,
        _getContext$credentia = _getContext.credentials,
        credentials =
          _getContext$credentia === void 0
            ? linkCredentials
            : _getContext$credentia,
        contextHeaders = _getContext.headers,
        _getContext$fetchOpti = _getContext.fetchOptions,
        contextFetchOptions =
          _getContext$fetchOpti === void 0 ? {} : _getContext$fetchOpti

      var fetchOptions = Object.assign(
        {},
        linkFetchOptions,
        contextFetchOptions,
        {
          headers: Object.assign(
            {},
            linkFetchOptions.headers,
            contextFetchOptions.headers,
            linkHeaders,
            contextHeaders
          ),
          method: 'POST'
        }
      )
      if (credentials) fetchOptions.credentials = credentials

      if (files.length) {
        fetchOptions.body = new FormData()
        fetchOptions.body.append('operations', JSON.stringify(requestOperation))
        fetchOptions.body.append(
          'map',
          JSON.stringify(
            files.reduce(function(map, _ref3, index) {
              var path = _ref3.path
              map[''.concat(index)] = [path]
              return map
            }, {})
          )
        )
        files.forEach(function(_ref4, index) {
          var file = _ref4.file
          return fetchOptions.body.append(index, file)
        })
      } else {
        fetchOptions.headers['content-type'] = 'application/json'
        fetchOptions.body = JSON.stringify(requestOperation)
      }

      linkFetch(uri, fetchOptions)
        .then(function(response) {
          setContext({
            response: response
          })
          if (!response.ok)
            throw new Error(
              ''.concat(response.status, ' (').concat(response.statusText, ')')
            )
          return response.json()
        })
        .then(function(result) {
          observer.next(result)
          observer.complete()
        })
        .catch(function(error) {
          return observer.error(error)
        })
    })
  })
}
