/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Navigation from './Navigation'
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY} from './PrimaryMap'
import {
  clearImageSearchResults,
  changeLoadedResults,
  discoverServiceIfNeeded,
  selectImage,
  startAlgorithmsWorkerIfNeeded,
  startJobsWorkerIfNeeded
} from '../actions'
import styles from './Application.css'

function selector(state) {
  return {
    datasets: state.jobs.records.map(job => {
      const result = state.results[job.id]
      return {
        job,
        progress: result ? result.progress : null,
        geojson: result ? result.geojson : null
      }
    }),
    imagery: state.imagery,
    loggedIn: !!state.login.authToken,
    workers: state.workers
  }
}

class Application extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    children: React.PropTypes.element,
    datasets: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    imagery: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    loggedIn: React.PropTypes.bool.isRequired,
    params: React.PropTypes.object.isRequired,
    workers: React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this._handleAnchorChange = this._handleAnchorChange.bind(this)
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleImageSelect = this._handleImageSelect.bind(this)
  }

  componentDidMount() {
    const {dispatch, location, loggedIn} = this.props
    if (loggedIn) {
      dispatch(discoverServiceIfNeeded())
      dispatch(startAlgorithmsWorkerIfNeeded())
      dispatch(startJobsWorkerIfNeeded())
    }
    dispatch(changeLoadedResults(asArray(location.query.jobId)))
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch} = this.props
    if (!this.props.loggedIn && nextProps.loggedIn) {
      dispatch(discoverServiceIfNeeded())
      dispatch(startAlgorithmsWorkerIfNeeded())
      dispatch(startJobsWorkerIfNeeded())
    }
    if (nextProps.location.query.jobId !== this.props.location.query.jobId) {
      dispatch(changeLoadedResults(asArray(nextProps.location.query.jobId)))
    }
    if (nextProps.params.bbox !== this.props.params.bbox) {
      dispatch(clearImageSearchResults())
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap datasets={this.props.datasets}
                    imagery={this.props.imagery.searchResults}
                    anchor={this.props.location.hash}
                    bbox={this.props.params.bbox}
                    mode={this._getMapMode()}
                    onAnchorChange={this._handleAnchorChange}
                    onBoundingBoxChange={this._handleBoundingBoxChange}
                    onImageSelect={this._handleImageSelect}/>
        {this.props.children}
      </div>
    )
  }

  //
  // Internal API
  //

  _getMapMode() {
    if (this.props.location.pathname.indexOf('create-job') === 0) {
      return (this.props.params.bbox && this.props.imagery.searchResults) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
    }
    return MODE_NORMAL
  }

  _handleAnchorChange(anchor) {
    if (this.props.location.hash !== anchor) {
      this.context.router.replace({
        ...this.props.location,
        hash: anchor
      })
    }
  }

  _handleBoundingBoxChange(bbox) {
    this.context.router.push({
      ...this.props.location,
      pathname: `/create-job${bbox ? '/' + bbox : ''}`
    })
  }

  _handleImageSelect(geojson) {
    this.props.dispatch(selectImage(geojson))
  }
}

export default connect(selector)(Application)

//
// Internals
//

function asArray(value) {
  if (value) {
    return [].concat(value)
  }
}
