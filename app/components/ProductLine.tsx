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

const styles = require('./ProductLine.css')

import * as React from 'react'
import * as moment from 'moment'
import {ActivityTable} from './ActivityTable'

interface Props {
  className?: string,
  productLine: beachfront.ProductLine
  onFetchJobs(productLineId: string, sinceDate: string)
  onJobHoverIn(job: beachfront.Job)
  onJobHoverOut(job: beachfront.Job)
  onJobSelect(job: beachfront.Job)
  onJobDeselect()
  onPanTo(productLine: beachfront.ProductLine)
}

interface State {
  error?: any
  isExpanded?: boolean
  isFetchingJobs?: boolean
  jobs?: beachfront.Job[]
  selectedJobs?: beachfront.Job[]
  sinceDate?: string
}

export class ProductLine extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      error: null,
      isExpanded: false,
      isFetchingJobs: false,
      selectedJobs: [],
      jobs: [],
      sinceDate: last24Hours(),
    }
    this._handleExpansionToggle = this._handleExpansionToggle.bind(this)
    this._handleJobRowClick = this._handleJobRowClick.bind(this)
    this._handleSinceDateChange = this._handleSinceDateChange.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isExpanded && (prevState.isExpanded !== this.state.isExpanded || prevState.sinceDate !== this.state.sinceDate)) {
      this._fetchJobs()
    }
    if (prevState.isExpanded && !this.state.isExpanded && this.state.selectedJobs.length) {
      this.props.onJobDeselect()
    }
  }

  render() {
    const {className, productLine} = this.props
    const {properties} = productLine
    const {isExpanded, sinceDate} = this.state
    return (
      <li className={`${styles.root} ${className || ''} ${isExpanded ? styles.isExpanded : ''}`}>
        <section className={styles.header} onClick={this._handleExpansionToggle}>
          <h3 className={styles.title}>
            <i className={`fa fa-chevron-right ${styles.caret}`}/>
            <span>{properties.name}</span>
          </h3>
          <div className={styles.controls}>
            <a onClick={() => this.props.onPanTo(this.props.productLine)} title="View on Map">
              <i className="fa fa-globe"/>
            </a>
          </div>
        </section>
        <section className={styles.details}>
          <div className={styles.metadata}>
            <dl>
              <dt>Scheduling</dt>
              <dd>{formatDate(properties.startsOn)} &mdash; {formatDate(properties.expiresOn) || 'Forever'}</dd>
              <dt>Algorithm</dt>
              <dd>{properties.algorithmName}</dd>
              <dt>Cloud Cover</dt>
              <dd>{properties.imageCloudCover}% or less</dd>
              {/*
              <dt>Compute Mask</dt>
              <dd>{computeMask}</dd>
              */}
              <dt>Spatial Filter</dt>
              <dd>{titleCase(properties.spatialFilterName) || 'None'}</dd>
              <dt>Owner</dt>
              <dd>{properties.owner}</dd>
              <dt>Date Created</dt>
              <dd>{formatDate(properties.createdOn)}</dd>
            </dl>
          </div>
          <ActivityTable
            className={styles.activityTable}
            isLoading={this.state.isFetchingJobs}
            jobs={this.state.jobs.filter(jobFilter(sinceDate))}
            selectedJobIds={this.state.selectedJobs.map(j => j.id)}
            error={this.state.error}
            sinceDate={sinceDate}
            sinceDates={[
              {value: last24Hours(), label: 'Last 24 Hours'},
              {value: last7Days(), label: 'Last 7 Days'},
              {value: last30Days(), label: 'Last 30 Days'},
              {value: properties.createdOn, label: 'All'},
            ]}
            onHoverIn={this.props.onJobHoverIn}
            onHoverOut={this.props.onJobHoverOut}
            onRowClick={this._handleJobRowClick}
            onSinceDateChange={this._handleSinceDateChange}
          />
        </section>
      </li>
    )
  }

  _fetchJobs() {
    this.setState({ isFetchingJobs: true })
    this.props.onFetchJobs(this.props.productLine.id, this.state.sinceDate)
      .then(jobs => this.setState({ jobs, isFetchingJobs: false }))
      .catch(error => this.setState({ error, isFetchingJobs: false }))
  }

  _handleExpansionToggle() {
    this.setState({ isExpanded: !this.state.isExpanded })
    // TODO -- scroll to positioning
  }

  _handleJobRowClick(job) {
    if (this.state.selectedJobs.some(j => j.id === job.id)) {
      this.props.onJobDeselect()
      this.setState({ selectedJobs: [] })
    }
    else {
      this.props.onJobSelect(job)
      this.setState({ selectedJobs: [job] })
    }
  }

  _handleSinceDateChange(sinceDate) {
    this.setState({ sinceDate })
  }
}

//
// Helpers
//

function formatDate(input) {
  const date = moment(input)
  if (date.isValid()) {
    return date.format('MM/DD/YYYY')
  }
  return null
}

function jobFilter(sinceDate) {
  return job => job.loading || (job.properties && job.properties.createdOn > sinceDate)
}

function last24Hours() {
  return moment().subtract(24, 'hours').startOf('hour').toISOString()
}

function last7Days() {
  return moment().subtract(7, 'days').startOf('hour').toISOString()
}

function last30Days() {
  return moment().subtract(30, 'days').startOf('hour').toISOString()
}

function titleCase(s) {
  return s.replace(/((?:^|\s)[a-z])/g, c => c.toUpperCase())
}
