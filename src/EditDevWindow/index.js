import React, {Component} from 'react'
import check from 'check-types'
import custCss from './style.module.css'
import axios from 'axios'
import {Row, Col, Button, Modal, ModalBody, ModalFooter, ModalHeader, } from 'react-bootstrap'
import Office from '../components/Office'
import Region from '../components/Region'
import City from '../components/City'
import DevType from '../components/DevType'
import Platform from '../components/Platform'
import Software from '../components/Software'
import Input from '../components/Base/Input'
import Input2 from '../components/Base/Input2'
import TextArea from '../components/Base/TextArea'
import TextArea2 from '../components/Base/TextArea2'
import CheckBox from '../components/Base/CheckBox'
import Modules from '../components/Modules'
import Ports from '../components/Ports'
import DevLocation from '../components/DevLocation'
// import RemoteDataProvider from "../components/Base/RemoteDataProvider"
import {DEV_DATA_URL, DEV_LOCATION_URL, DEV_MODULES_DATA_URL, DEV_PORTS_DATA_URL, DEV_SUBMIT_URL, VRF_LIST_URL} from'../constants'

class EditDevWindow extends Component {
    constructor(props, context) {
        super(props, context);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }
     /**
      * @typedef {{
      *      floor: (number|string),
      *      row: (number|string),
      *      rack: (number|string),
      *      unit: (number|string),
      *      rackSide: string
      * }} Site
      *
      * @typedef {{
      *      hostname: string,
      *      site: Site
      * }} DevDetails
      *
      * @typedef {{
      *     dev_id: number,
      *     location_id: number,
      *     platform_id: number,
      *     platform_item_id: number,
      *     software_id: number,
      *     software_item_id: number,
      *     vendor_id: number,
      *     dev_type_id: number,
      *     dev_comment: string,
      *     software_comment: string,
      *     dev_last_update: string,
      *     dev_in_use: boolean,
      *     platform_sn: string,
      *     platform_sn_alt: string,
      *     is_hw: boolean,
      *     software_ver: string,
      *     dev_details: (Dev_details|object),
      *     software_details: object
      * }} DevInfo
      *
      * @typedef {{
      *     module: string
      *     module_item_id: number,
      *     module_item_details: object,
      *     module_item_sn: string,
      *     module_in_use: boolean,
      *     module_not_found: boolean
      * }} Module
      *
      * @typedef {{
      *     description: string,
      *     portName: string
      * }} PortDetails
      *
      * @typedef {{
      *     port_id: number,
      *     port_ip: string,
      *     port_comment: string,
      *     port_details: PortDetails,
      *     port_is_mng: boolean,
      *     port_mac: string,
      *     port_mask_len: (string|number),
      *     newPort: boolean // for created ports is true
      * }} Port
      *
      * @typedef {{
      *     region_id: number,
      *     city_id: number,
      *     office_id: number
      *     office_comment
      * }} GeoLocation
      *
      * @typedef {{
      *     accessor: string,
      *     statement: string,
      *     value: (string|number)
      * }} Filter
      */

      /**
      * @type {{
      *     show: boolean,
      *     devId: (number|string),
      *     devDataLoading: boolean,
      *     devDataReady: boolean,
       *     mngPorts: array
      * }} state
      */
    state = {
        show: false,
        devId: '',
        devDataLoading: false,
        devDataReady: false,
        mngPorts: [],
        mngIp: '',
        officeComment: '',
        loadingOfficeData: false
    }
    /**
     * @type {{
     *    geoLocation: (GeoLocation|object),
     *     devInfo: (DevInfo|object),
     *     modules: (Module[]|Array),
     *     ports: (Port[]|Array)
     * }} initialData
     */
    initialData = {
        geoLocation: {},
        devInfo: {},
        modules: [],
        ports: [],
    }

    /**
     * @type {{
     *     geoLocation: (GeoLocation|object),
     *     devInfo: (DevInfo|object),
     *     modules: (Module[]|Array),
     *     ports: (Port[]|Array),
     *     mngIp: string
     * }} currentState
     */
    currentState = {
        geoLocation: {},
        devInfo: {},
        modules: [],
        ports: [],

    }
    /**
     * @type Filter cityFilter
     */
    cityFilter = {
        accessor: 'region_id',
        statement: '=',
        value: ''
    }
    /**
     * @type Filter officeFilter
     */
    officeFilter = {
        accessor: 'city_id',
        statement: '=',
        value: ''
    }
    getDevLocation = async (location_id) => {
        try {
            console.log('LOADING')
            const res = await axios.get(DEV_LOCATION_URL, {
                params: {location_id}
            })
            const {data} = res
            if (!data.location) {
                console.log('ERROR: getDevLocation')
                return {}
            }
            return data
        } catch (e) {
            console.log('ERROR: getDevLocation', e.toString())
            return {}
        }
    }
    // getOffice = async (office_id) => {
    //     try {
    //         const res = await axios.get(GET_OFFICE_URL, {
    //             params: {office_id}
    //         })
    //         const {data} = res
    //         if (!data.office) {
    //             console.log('ERROR: getOffice')
    //             return {}
    //         }
    //         return data
    //     } catch (e) {
    //         console.log('ERROR: getOffice', e.toString())
    //         return {}
    //     }
    // }

    managingIp = (portsInfo) => {
        console.log('mngIP==========', portsInfo)
        if (!check.array(portsInfo)) return
        const res = portsInfo.filter((port) => port.port_is_mng).map((port) => port.port_ip)
        return res.join(', ')
    }

    handleClose() {
        this.setState({ show: false });
    }
    handleSubmit = async() => {
        console.log('SUBMIT', this.currentState)
        try {
            /**
             * @typedef {{
             *     code: number,
             *     message: string
             * }} Error
             * @type {{
             *     errors: Error[]
             * }} res
             */
            const res = await axios.post(DEV_SUBMIT_URL, this.currentState)
            const {data} = res
            if (data.errors) throw data.errors
            console.log('SAVE RESULT', res)
        } catch (e) {
            console.log('ERROR: ', e)
        }
    }

    handleShow() {
        this.setState({ show: true });
    }

    onChangeGeoLocation = (key) => async ({value}) => {
        const {geoLocation} = this.currentState
        geoLocation[key] = value
        if (key === 'office_id') {
            this.onChangeDevInfo('location_id')({value})
            this.setState({loadingOfficeData: true})
            const res = await this.getDevLocation(value)
            const {location = {}} = res
            let {office_comment} = location
            office_comment = office_comment ? office_comment : ''
            const {geoLocation} = this.currentState
            geoLocation.office_comment = office_comment
            this.setState({officeComment: office_comment, loadingOfficeData: false})
        }
        console.log('geolocation', geoLocation)
    }
    onChangeOfficeComment = (e) => {
        const {geoLocation} = this.currentState
        geoLocation.office_comment = e.target.value
        this.setState({officeComment: e.target.value})
    }
    onChangeDevInfo = (key) => ({value}) => {
        const {devInfo} = this.currentState
        devInfo[key] = value
        // console.log('DevInfo', devInfo, geoLocation)
    }
    onChangeDevDetails = (key) => ({value}) => {
        const {devInfo} = this.currentState
        if (! devInfo.dev_details) devInfo.dev_details = {}
        devInfo.dev_details[key] = value
    }
    onChangeModule = (key) => (idx) => ({value}) => {
        const {modules} = this.currentState
        if (modules[idx] && modules[idx][key] !== value) {
            modules[idx][key] = value
        }
        // console.log('Modules', modules)
    }
    changeMngIpString = (ports) => {
        console.log('mngIP==========', ports)
        if (!check.array(ports)) return
        const res = ports.filter((port) => port.port_is_mng).map((port) => port.port_ip)
        if (res.length > 0) {
            this.setState({mngIp:res.join(', ') })
        }
    }
    onChangePorts = ({ports}) => {
        ports = ports.map((port) => {
            return {...port, port_mask_len: port.port_mask_len === '' ? null : parseInt(port.port_mask_len)}
        })
        this.currentState.ports = ports
        this.changeMngIpString(this.currentState.ports)
        console.log('Ports', ports)
    }
    onChangeDevLocation = (key) => ({value}) => {
        if (value === undefined) return
        const {devInfo} = this.currentState
        if (!(devInfo && devInfo.dev_details && devInfo.dev_details.site))  return
        devInfo.dev_details.site[key] = value
        console.log('SITE', devInfo.dev_details.site)
    }

    fetchDeviceData = async (id) => {
        try {
            const res = await axios.get(DEV_DATA_URL, {
                params: {id}
            })
            const {data} = res
            if (!data.devInfo) {
                console.log('ERROR: fetchDeviceData')
                return {}
            }
            return data
        } catch (e) {
            console.log('ERROR: fetchDeviceData', e.toString())
            return {}
        }
    }
    fetchDevModulesData = async (id) => {
        try {
            const res = await axios.get(DEV_MODULES_DATA_URL, {
                params: {id}
            })
            const {data} = res
            if (!data.modules) {
                console.log('ERROR: fetchDevModulesData')
                return []
            }
            return data
        } catch (e) {
            console.log('ERROR: fetchDevModulesData', e.toString())
            return []
        }
    }
    fetchDevPortsData = async (id) => {
        try {
            const res = await axios.get(DEV_PORTS_DATA_URL, {
                params: {id}
            })
            const {data} = res
            if (!data.ports) {
                console.log('ERROR: fetchDevPortsData')
                return []
            }
            return data
        } catch (e) {
            console.log('ERROR: fetchDevPortsData', e.toString())
            return []
        }
    }
    fetchVrfList = async () => {
        try {
            const res = await axios.get(VRF_LIST_URL, {
                params: {}
            })
            const {data} = res
            if (!data.vrfList) {
                console.log('ERROR: fetchVrfList')
                return []
            }
            return data
        } catch (e) {
            console.log('ERROR: fetchVrfList', e.toString())
            return []
        }
    }
    submitForm = () => {
        console.log('SUBMIT', this.currentState)
    }

    memoizedCityFilter = ((prevFilter) => () => {
        // console.log(prevFilter.region_id === this.state.region_id ? 'old_city_filter' : 'new_city_filter')
        if (prevFilter.region_id !== this.state.region_id) prevFilter = Object.assign({}, this.cityFilter, {region_id: this.state.region_id})
        return prevFilter
    })('')

    memoizedOfficeFilter = ((prevFilter) => () => {
        // console.log(prevFilter.city_id === this.state.city_id ? 'old_city_filter' : 'new_city_filter')
        if (prevFilter.city_id !== this.state.city_id) prevFilter = Object.assign({}, this.officeFilter, {city_id: this.state.city_id})
        return prevFilter
    })('')

    render() {
        const {geoLocation, devInfo, modules, ports} = this.initialData
        const devSite = (() => {
            const {floor, row, rack, unit, rackSide} = devInfo && devInfo.dev_details && devInfo.dev_details.site ? devInfo.dev_details.site : {}
            return {floor, row, rack, unit, rackSide}
        })()
        console.log('EditDevWindow render', this.initialData.devInfo, 'ready', this.state.devDataReady, 'loading', this.state.devDataLoading, this.state.show, this.state.devId, 'defSelected', geoLocation.region_id, devSite)

        return (
            <Modal show={this.state.show} onHide={this.handleClose} bsSize="large" >
                <ModalHeader closeButton>
                    <Modal.Title>Modal heading. Device ID: {this.state.devId} </Modal.Title>
                </ModalHeader>
                <ModalBody className={custCss.modalBody} >
                    <Row>
                        <Col md={2}><Region onChange={this.onChangeGeoLocation} defaultSelected={geoLocation.region_id}/></Col>
                        <Col md={2}><City onChange={this.onChangeGeoLocation} defaultSelected={geoLocation.city_id} filter={this.cityFilter}/></Col>
                        <Col md={4}><Office onChange={this.onChangeGeoLocation} defaultSelected={geoLocation.office_id} /></Col>
                        {/*<Col md={4}><TextArea controlId="officeComment" onChange={this.onChangeGeoLocation('office_comment')} placeholder='Комментарий к офису' defaultValue={geoLocation.office_comment} label="Комментарий к оффису" /></Col>*/}
                        <Col md={4}><TextArea2 controlId="officeComment" disabled={this.state.loadingOfficeData} onChange={this.onChangeOfficeComment} placeholder='Комментарий к офису' value={this.state.officeComment} label="Комментарий к оффису" /></Col>
                    </Row>
                    <Row>
                        <Col md={3}><DevType onChange={this.onChangeDevInfo} defaultSelected={devInfo.dev_type_id} /></Col>
                        <Col md={3}><Platform defaultSelected={devInfo.platform_id}/></Col>
                        <Col md={3}><Software onChange={this.onChangeDevInfo}  defaultSelected={devInfo.software_id} /></Col>
                        <Col md={3}><Input controlId='swVer' onChange={this.onChangeDevInfo('software_ver')} defaultValue={devInfo.software_ver} label="Версия ПО"/></Col>
                    </Row>
                    <Row>
                        <Col md={3}><Input controlId='devSn' addOnPosition="left" addOnText="SN" onChange={this.onChangeDevInfo('platform_sn')} defaultValue={devInfo.platform_sn} label=" " readOnly/></Col>
                        <Col md={3}><Input controlId='devAltSn' addOnPosition="left" addOnText="alt SN" onChange={this.onChangeDevInfo('platform_sn_alt')} defaultValue={devInfo.platform_sn_alt} label=" " /></Col>
                        <Col md={3}><Input controlId='hostname' addOnPosition="left" addOnText="hostname" onChange={this.onChangeDevDetails('hostname')} defaultValue={devInfo.dev_details && devInfo.dev_details.hostname} label=" " /></Col>
                        <Col md={3}><Input2 readOnly controlId='managementIP' addOnPosition="left" addOnText="management IP" onChange={()=>{}} label=" " value={this.state.mngIp} /></Col>
                    </Row>
                    <Row>
                        <Col md={6}><TextArea controlId="deviceComment" onChange={this.onChangeDevInfo('dev_comment')} placeholder='Комментарий к устройству' defaultValue={devInfo.dev_comment} label="Коментарий к устройству" /></Col>
                    </Row>
                    <Row><Col md={6}><CheckBox title="Устройство используется" onChange={this.onChangeDevInfo('dev_in_use')} checked={devInfo.dev_in_use} >Устройство используется</CheckBox></Col></Row>
                    <Row>
                        <Col md={10}><Modules data={modules} onChange={this.onChangeModule} /></Col>
                    </Row>
                    <Ports data={ports} vrfData={this.vrfList} onChange={this.onChangePorts} />
                    <Row>
                        <Col md={10}>
                            <DevLocation {...devSite} onChange={this.onChangeDevLocation} />
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleClose} bsStyle="danger" >Отмена</Button>
                    <Button onClick={this.handleSubmit} bsStyle="success">Сохранить</Button>
                </ModalFooter>
            </Modal>
        )
    }
    async componentDidMount() {
        window.openEditModal = ((id) => {
            this.setState({
                show: true,
                devId: id
            })
        })(1506)
    }

    async componentDidUpdate() {
        const {devId, devDataReady, devDataLoading} = this.state
        if (devId && !devDataReady && !devDataLoading) {
            this.setState({devDataLoading: true})
            // const devData = await this.fetchDeviceData(this.state.devId)
            try {
                const response1 = await Promise.all([
                    this.fetchDeviceData(devId),
                    this.fetchDevModulesData(devId),
                    this.fetchDevPortsData(devId),
                    this.fetchVrfList()
                ])
                const [{devInfo}, {modules}, {ports}, {vrfList}] = response1
                let geoLocation = {}
                if (devInfo && devInfo.location_id) {
                    const response2 = await this.getDevLocation(devInfo.location_id)
                    const {location = {}} = response2
                    const {location_id: office_id, city_id, region_id, office_comment} = location
                    geoLocation = {office_id, city_id, region_id, office_comment}
                }
                this.initialData = {...this.initialData, devInfo, modules, ports, geoLocation}
                this.vrfList = vrfList
                this.currentState = {
                    geoLocation: JSON.parse(JSON.stringify(geoLocation)),
                    devInfo: JSON.parse(JSON.stringify(devInfo)),
                    modules: JSON.parse(JSON.stringify(modules)),
                    ports: JSON.parse(JSON.stringify(ports)),
                }
                console.log('didUpdate', this.initialData)
                this.setState({devDataLoading: false, devDataReady: true})
            } catch (e) {
                console.log('Loading dev data ERROR', e.toString())
            }

        }
    }
}

export default EditDevWindow
