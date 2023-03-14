import { gql } from 'graphql-request';
import { DataType } from './dataType';

export const QUERY = gql`
  query Features($productId: ID!) {
    product(productId: $productId) {
      id
      features(status: ACTIVE) {
        id
        key
      }
      userTraits {
        name
        dataType
      }
      teamTraits {
        name
        dataType
      }
    }
  }
`;

export type Query = {
  product: {
    id: string;
    features: Array<{
      id: string;
      key: string;
    }>;
    userTraits: Array<{
      name: string;
      dataType: DataType;
    }>;
    teamTraits: Array<{
      name: string;
      dataType: DataType;
    }>;
  };
};
