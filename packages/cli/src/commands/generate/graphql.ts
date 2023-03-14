import { gql, GraphQLClient } from 'graphql-request';
import { API_URL } from '~/constants';
import { logError } from '~/logger';
import { DataType } from './dataType';

const QUERY = gql`
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

export async function fetchProduct(productId: string, token: string) {
  const graphqlClient = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const { product } = await graphqlClient.request<Query>(QUERY, {
      productId,
    });
    return product;
  } catch (err) {
    logError(`Could not fetch product with id ${productId}`);
    return null;
  }
}
