import React from 'react';
import PropTypes from "prop-types";

import './style.scss';

const renderActsTh = renderActs => {
    if (!renderActs) {
        return null;
    }

    return (
        <th className="c-table__thead-th c-table__thead-th--acts"/>
    )
};

const renderActsTd = (renderActs, item) => {
    if (!renderActs) {
        return null;
    }

    return (
        <td
            className="c-table__tbody-td c-table__tbody-td--acts"
            key={`acts_td_${item.toString()}`}
        >
            {renderActs(item)}
        </td>
    )
};

const renderTableTh = (header, sortBy, sortByDirection, setSortBy) => {
    let arrow = '';

    if (sortBy === header.key) {
        arrow = sortByDirection === 'ASC' ? '↓' : '↑';
    }

    return (
        <th
            key={`th_${header.key}`}
            className="c-table__thead-th"
            onClick={() => {setSortBy(header.key)}}
        >
            {header.title} <span className={"staff-columns__arrow-item"}> {arrow} </span>
        </th>
    )
};

const Table = props => {
    const {
        headers,
        items,
        renderActs,
        uniqueTrKey,
        baseClassName,
        sortBy,
        sortByDirection,
        setSortBy,
        formatTd
    } = props;

    return (
        <table className={`c-table ${baseClassName}`}>
            <thead className="c-table__thead">
                <tr className="c-table__thead-tr">
                    {headers.map(header => {
                        return renderTableTh(header, sortBy, sortByDirection, setSortBy);
                    })}
                    {renderActsTh(renderActs)}
                </tr>
            </thead>
            <tbody className="c-table__tbody">
            {items.map(item => {
                return (
                    <tr className="c-table__tbody-tr" key={`tr_${item[uniqueTrKey]}`}>
                        {headers.map(header => {
                            return (
                                <td
                                    className="c-table__tbody-td"
                                    key={`${header.key}_${item.toString()}`}
                                >
                                    {formatTd(item, header.key)}
                                </td>
                            )
                        })}
                        {renderActsTd(renderActs, item)}
                    </tr>
                )
            })}
            </tbody>
        </table>
    );
};

Table.defaultProps = {
    uniqueTrKey: 'id',
    formatTd: (item, key) => item[key],
};

Table.propTypes = {
    items: PropTypes.array.isRequired,
    headers: PropTypes.array.isRequired,
    renderActs: PropTypes.func,
    uniqueTrKey: PropTypes.string,
    baseClassName: PropTypes.string,
    sortBy: PropTypes.string,
    sortByDirection: PropTypes.string,
    setSortBy: PropTypes.func,
    formatTd: PropTypes.func,
};

export default Table;
