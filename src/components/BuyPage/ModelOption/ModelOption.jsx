import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import './ModelOption.css';

import Button from '../../Button/Button';
import Rocker from '../../Rocker/Rocker';

function Memory({ memory }) {
    return (
        <div className="Memory">
            <h3 className="Memory-amount">{ memory }</h3>
            <p className="Memory-quantifier">GB</p>
        </div>
    );
}

function MemoryOption({ memory, memorySlug, price, priceText, selected, onSelect }) {
    let className = "MemoryOption";
    if (selected && selected.memorySlug === memorySlug) { className += " MemoryOption-selected"; }
    return (
        <button
            type="button"
            className={className}
            onClick={() => onSelect && onSelect({ memory, memorySlug, price, priceText })}
        >
            <Memory memory={memory} />
            <p className="MemoryOption-price">{ priceText }</p>
        </button>
    );
}

function ModelOption({ model, modelSlug, memoryOptions, history }) {
    const [stage, setStage] = useState(0);

    // Selected model/memory configuration
    const [selected, setSelected] = useState(null);

    const allConfigs = memoryOptions.map(memoryOption => 
        <MemoryOption
            key={memoryOption.memorySlug}
            {...memoryOption}
            selected={selected}
            onSelect={setSelected}
        />
    );

    const selectedConfig = <MemoryOption {...selected} selected={selected} />;

    // Quantity rocker
    const [quantity, setQuantity] = useState(1);
    const quantityRockerRef = useRef(null);
    useEffect(() => {
        if (stage === 1) {
            quantityRockerRef.current.focus();
        }
    }, [stage]);

    // Button text
    let buttonText = 'Continue';
    if (stage === 1) {
        buttonText = 'Add to Cart';
    } else if (stage === 2) {
        buttonText = 'Go to Cart';
    }

    // Add to cart
    const addToCart = (order) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        localStorage.setItem('cart', JSON.stringify([ ...cart, order ]));
    }
    
    // Flow control
    const nextStage = () => {
        if (stage === 0) {
            setStage(1);
        } else if (stage === 1) {
            addToCart({
                item: { ...selected, model, modelSlug },
                quantity,
            });
            setStage(2);
        } else if (stage === 2) {
            history.push('/cart');
        }
    }

    const reset = () => {
        setStage(0);
        setSelected(null);
    }

    return (
        <div className="ModelOption">
            <h3>{ model }</h3>
            <div className="ModelOptions-configs">
                { stage === 0 ? allConfigs : selectedConfig }
                { stage === 1 &&
                <Rocker
                    title="Quantity"
                    name="quantity"
                    value={quantity}
                    min={1}
                    max={100}
                    onChange={setQuantity}
                    inputRef={quantityRockerRef}
                />
                }
                { stage === 2 &&
                <div className="ModelOption-success">
                    <p>Successfully added { quantity } to your cart!</p>
                </div>
                }
            </div>
            <div className="ModelOptions-controls">
                { stage > 0 &&
                <Button text="Back" onClick={reset} color="black" backgroundColor="white" fitted={true} marginRight={true} />
                }
                { selected === null ?
                    <p className="ModelOption-prompt">Select a model</p>
                :   <Button text={buttonText} onClick={nextStage}/>
                }
            </div>
        </div>
    );
}

export default withRouter(ModelOption);