import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'antd';

import { useStock, Model } from '../../modules/stock';

import Price from '../Price';
import { Heading } from '../../utils';
import { Container, StockList } from './elements';
import iPhoneIMG from '../../pages/HomePage/cover.jpg';

const { Meta } = Card;

type Props = {
  tradeAmt?: number;
};

const Catalogue: React.FC<Props> = ({ tradeAmt }) => {
  const { stock } = useStock();

  const renderStockItem = (si: Model) => {
    return (
      <Link
        key={si.slug}
        to={{
          pathname: `${si.slug}/`,
          state: { si },
        }}
      >
        <Card
          hoverable
          cover={
            <img
              style={{ height: '100%', objectFit: 'cover' }}
              src={si.imageUrls[0] || iPhoneIMG}
              alt={si.model}
            />
          }
        >
          <Meta
            title={si.model}
            description={
              <div>
                Starting from:
                {si.configurations[0].price - (tradeAmt || 0) > 0 ? (
                  <div>
                    You <strong>pay</strong>
                    <Price
                      amt={si.configurations[0].price}
                      reduction={tradeAmt}
                      block
                    />
                  </div>
                ) : (
                  <div>
                    You <strong>get</strong>
                    <Price
                      amt={si.configurations[0].price}
                      reduction={tradeAmt}
                      abs
                      block
                    />
                  </div>
                )}
              </div>
            }
          />
        </Card>
      </Link>
    );
  };

  return (
    <Container>
      <Heading>
        {!tradeAmt ? 'Select Model' : 'Which iPhone do you want?'}
      </Heading>
      <StockList>
        {stock
          .sort((a, b) => a.configurations[0].price - b.configurations[0].price)
          .filter(si => si.configurations.length)
          .map(si => renderStockItem(si))}
      </StockList>
    </Container>
  );
};

export default Catalogue;
