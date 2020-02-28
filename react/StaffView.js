import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {
    deleteStaffError,
    fetchStaffs,
    getPageCount,
    isShowModalChangePassword,
    isShowModalCreate,
    isShowModalUpdate,
    fetchStaff,
} from "../../modules/staffs/selectors";
import {Button, Form, Modal, Select} from "antd";
import CreateNewStaff from "../CreateNewStaff";
import Header from "../Header";
import EditStaff from '../EditStaff'
import Table from "../Table";
import Pagination from "../Pagination";
import ChangePasswordModal from '../ChangePasswordModal'
import {FormattedMessage, injectIntl} from "react-intl";
import {getAuthProfile, getProfileRole} from "../../modules/auth/selectors";
import {getRolesOptions, SUPERADMIN} from "./enum/roles";
import {isCurrentRoleHigherOrEq} from '../../utils/authGate'
import {
    closeChangePasswordModal,
    closeCreateStaffModal,
    closeUpdateStaffModalVisible,
    deleteStaff, getStaffs,
    setStaffCriteria,
    showChangePasswordModal,
    showCreateModalVisible,
    showUpdateStaffModalVisible
} from "../../modules/staffs/actions"
import './styles.scss'

class StaffView extends Component {

    state = {
        activeEditStaffId: null,
        activeDeleteStaffId: null,
    };

    componentDidMount() {
        this.props.getStaffs();
    }

    showEditModal = id => {
        this.props.showUpdateStaffModalVisible();
        this.setState({
            activeEditStaffId: id,
        });
    };

    showChangeModal = id => {
        this.props.showChangePasswordModal();
        this.setState({
            activeEditStaffId: id,
        })
    };

    onDelete = (id) => {
        this.props.deleteStaff(id);
    };

    showDeleteConfirm = (id) => {
        const {confirm} = Modal;
        confirm({
            title: 'Are you sure delete this staff?',
            content: 'This operation is not reversible.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                this.onDelete(id);
                this.props.getStaffs();
            },
        });
    };

    setSortBy = sortBy => {
        let sortByDirection = this.props.requestCriteria.sortByDirection === 'ASC' ? 'DESC' : 'ASC';
        this.props.setStaffCriteria({
            sortBy,
            sortByDirection
        });
    };

    setPage = page => {
        this.props.setStaffCriteria({
            page
        });
    };

    handleFilterSubmit = (e) => {
        e.preventDefault();
        const filter = this.props.form.getFieldsValue();
        this.props.setStaffCriteria({
            ...filter,
            page: 1,
        });
    };

    checkRolesPermissions = () => {
        if (this.props.profileRole === SUPERADMIN) {
            return (
                <>
                    <CreateNewStaff
                        closeStaffModal={this.props.closeCreateStaffModal}
                        modalVisible={this.props.createModalVisible}/>
                    <div className="c-staff-view__wrapper__create-user-button">
                        <Button type="primary" className={"c-staff-view__create-user-button"}
                                onClick={this.props.showCreateModalVisible}>
                            <FormattedMessage id="staff.create.button"/>
                        </Button>
                    </div>
                </>
            )
        } else {
            return '';
        }
    };

    getFilterRoles = () => {
        const roles = getRolesOptions().filter(role => isCurrentRoleHigherOrEq(this.props.profileRole, role.value));

        if (this.props.profileRole === SUPERADMIN) {
            roles.push({
                value: '',
                label: 'auth.filter.showAll'
            });
        }

        return roles;
    };

    renderActs = staff => {
        return (
            <>
                <button
                    className="c-staff-view__button-option"
                    onClick={() => {
                        this.showDeleteConfirm(staff.id)
                    }}
                >
                    X
                </button>
                <button
                    onClick={() => this.showEditModal(staff.id)}
                    className="c-staff-view__table-staff__edit-link c-staff-view__button-option"
                >
                    <img src={"img/edit.png"} alt="Edit"/>
                </button>
                <button
                    onClick={() => this.showChangeModal(staff.id)}
                    className="c-staff-view__table-staff__password-link c-staff-view__button-option"
                >
                    <img className={"c-staff-view__password-link__lock"}
                         src={"img/lock.png"}
                         alt="Password"/></button>
            </>
        )
    };

    render() {
        const roles = this.getFilterRoles();
        const {intl} = this.props;
        const {getFieldDecorator} = this.props.form;
        const {Option} = Select;
        const {staffList} = this.props;

        const headers = [
            {
                key: 'id',
                title: intl.formatMessage({id: 'staff.table.id'}),
            },
            {
                key: 'login',
                title: intl.formatMessage({id: 'staff.table.login'}),
            },
            {
                key: 'role',
                title: intl.formatMessage({id: 'staff.table.role'}),
            },
            {
                key: 'email',
                title: intl.formatMessage({id: 'staff.table.email'}),
            },
        ];

        return (
            <div className="staff__container">
                <Header/>
                <EditStaff
                    closeEditModal={this.props.closeUpdateStaffModalVisible}
                    staffId={this.state.activeEditStaffId}
                    editModalVisible={this.props.editModalVisible}/>
                <ChangePasswordModal
                    closeEditModal={this.props.closeChangePasswordModal}
                    staffId={this.state.activeEditStaffId}
                    changePasswordModalVisible={this.props.changePasswordModalVisible}
                />

                <div className="c-staff-view__staff-container__wrapper">
                    <div className="c-staff-view__wrapper__name-tag">
                        <h2 className="c-staff-view__name-tag"><FormattedMessage
                            id="staff.heading"/></h2>
                        {this.checkRolesPermissions()}
                    </div>
                    {staffList
                        ?
                        <div className="c-staff-view__wrapper__table-staff">
                            <Table
                                baseClassName="c-staff-view__table"
                                items={this.props.staffList}
                                headers={headers}
                                renderActs={this.renderActs}
                                sortBy={this.props.requestCriteria.sortBy}
                                setSortBy={this.setSortBy}
                                sortByDirection={this.props.requestCriteria.sortByDirection}
                            />
                            <div className="c-staff-view__wrapper__filter-holder">
                                <Form onSubmit={this.handleFilterSubmit} className="c-staff-view__filter-holder__form-filter" style={{
                                    margin: '0 auto',
                                    textAlign: 'center'
                                }}>
                                    <Form.Item>
                                        {getFieldDecorator('role', {
                                            initialValue: this.props.requestCriteria.role
                                        })
                                        (<Select
                                            className={"c-staff-view__form__select"}
                                            style={{width: '100%'}}
                                            placeholder={"Filter"}
                                        >
                                            {roles.map(role => {
                                                    return (
                                                        <Option key={role.value}
                                                                value={role.value}
                                                                label={intl.formatMessage({id: role.label})}><FormattedMessage
                                                            id={role.label}/></Option>

                                                    )
                                                }
                                            )
                                            }
                                        </Select>)}
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" className="c-staff-view__filter-button" htmlType="submit">
                                            <FormattedMessage id="filter.button"/>
                                        </Button>
                                    </Form.Item>
                                </Form>

                            </div>
                            <Pagination
                                page={this.props.requestCriteria.page}
                                pageCount={this.props.pageCount}
                                setPage={this.setPage}
                            />
                        </div>

                        : null
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        staffList: fetchStaffs(state),
        pageCount: getPageCount(state),
        error: deleteStaffError(state),
        profile: getAuthProfile(state),
        createModalVisible: isShowModalCreate(state),
        editModalVisible: isShowModalUpdate(state),
        changePasswordModalVisible: isShowModalChangePassword(state),
        profileRole: getProfileRole(state),
        requestCriteria: fetchStaff(state),
    }
}

const mapDispatchToProps = {
    getStaffs,
    deleteStaff,
    showCreateModalVisible,
    closeCreateStaffModal,
    showUpdateStaffModalVisible,
    closeUpdateStaffModalVisible,
    closeChangePasswordModal,
    showChangePasswordModal,
    setStaffCriteria,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Form.create({name: 'filterRole'})(withRouter(injectIntl(StaffView))));
