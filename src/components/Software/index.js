import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import Select from '../Base/Select'
import RemoteDataProvider from '../Base/RemoteDataProvider'
import check from "check-types"

const URL = 'http://netcmdb-loc.rs.ru:8082/api/getSoftwareList.json'

class Software extends PureComponent {

    optionListUpdater = RemoteDataProvider(URL)
    render() {
        const onChange = check.function(this.props.onChange) ? this.props.onChange('software_id') : undefined
        console.log('devType', this.props.defaultSelected)
        return <Select {...this.props} isAsync remoteDataFetch={this.optionListUpdater} onChange={onChange} />
    }
}


Software.propTypes = {
    controlId: PropTypes.string,
    disabled: PropTypes.bool,
    label: PropTypes.string,
    defaultSelected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.func)
    ]),
    filter: PropTypes.shape({
        accessor: PropTypes.string,
        statement: PropTypes.string,
        value: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ])
    })
}
Software.defaultProps = {
    label: 'ПО',
    controlId: 'softwareSelector',
    filter: {
        accessor: '',
        statement: '',
        value: ''
    }
}

export default Software
