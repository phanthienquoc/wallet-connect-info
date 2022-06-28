import React, { memo, useCallback, useState } from 'react';

const List = memo(() => {
    const [items, setItems] = useState([
        { value: '' },
        { value: '' },
        { value: '' }
    ])

    const _handleChangeItem = useCallback((id, value) => {
        setItems(state => state.map((item, index) => {
            return index !== id ? item : { value: value }
        }))
    }, [])

    return (
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <h3>List item</h3>
            <div className='list-item' style={{ marginTop: "24px" }}>
                {
                    items.map((item, index) => (
                        <Item
                            key={index}
                            id={index}
                            value={item.value}
                            onChange={_handleChangeItem}
                        />
                    ))
                }
            </div>
        </div>
    )
})

const Item = memo(({ id, value, onChange }) => {
    return (
        <div style={{ display: "flex", marginBottom: "32px", alignItems: "center" }}>
            <div style={{ marginRight: "32px", width: "148px" }}>{`Item ${id}:`}</div>
            <input style={{ height: "32px", width: "100%" }} onChange={e => onChange(id, e.target.value)} value={value} />
        </div>
    )
})


export default List;