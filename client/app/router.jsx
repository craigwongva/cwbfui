import React from 'react'
import {createHistory} from 'history'
import {Router, Route, useRouterHistory} from 'react-router'
import {render} from 'react-dom'
import Application from './components/Application'
import CreateJob from './components/CreateJob'
import JobStatusList from './components/JobStatusList'
import Help from './components/Help'
import About from './components/About'

export function bootstrap(element) {
  const history = useRouterHistory(createHistory)({
    basename: '/'
  })
  render(
    <Router history={history}>
      <Route path="/" component={Application}>
        <Route path="job" component={JobStatusList}/>
        <Route path="job/:resultId" component={JobStatusList}/>
        <Route path="new" component={CreateJob}/>
        <Route path="new/:algorithmId" component={CreateJob}/>
        <Route path="help" component={Help}/>
        <Route path="about" component={About}/>
      </Route>
    </Router>, element)
}
