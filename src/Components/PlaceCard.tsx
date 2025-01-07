import React from 'react';
import {NavLink} from 'react-router-dom';
import {OfferDTO} from '../Types/Offer/Offer.ts';
import {Toggle} from './Toggle.tsx';
import {StarsRating} from '../Pages/Offer/StarsRating.tsx';

export interface PlaceCardProps {
  offer: OfferDTO;
  classPrefix: string;
  setActivePlace?: (offer: OfferDTO | undefined) => void;
  toggleFavorite?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = (props) => (
  <article
    className={`${props.classPrefix}__card place-card`}
    onMouseEnter={() => props.setActivePlace === undefined ? () => {
    } : props.setActivePlace(props.offer)}
    onMouseLeave={() => props.setActivePlace === undefined ? () => {
    } : props.setActivePlace(undefined)}
  >
    {
      props.offer.isPremium &&
      <div className="place-card__mark">
        <span>Premium</span>
      </div>
    }
    <div className={`${props.classPrefix}__image-wrapper place-card__image-wrapper`}>
      <NavLink to={`/offer/${props.offer.id}`}>
        <img className={`place-card__image ${props.classPrefix}__image`} src={props.offer.previewImage} alt="Place image"/>
      </NavLink>
    </div>
    <div className={`${props.classPrefix}__card-info place-card__info`}>
      <div className="place-card__price-wrapper">
        <div className="place-card__price">
          <b className="place-card__price-value">&euro;{props.offer.price}</b>
          <span className="place-card__price-text">&#47;&nbsp;night</span>
        </div>
        <Toggle
          classPrefix="place-card__bookmark"
          onToggle={props.toggleFavorite}
          altText="In bookmarks"
          isActive={props.offer.isFavorite}
          iconStyle={{width: 18, height: 19}}
        />
      </div>
      <StarsRating rating={props.offer.rating} classPrefix="place-card"/>
      <h2 className="place-card__name">
        <NavLink to={`/offer/${props.offer.id}`}>{props.offer.title}</NavLink>
      </h2>
      <p className="place-card__type">{props.offer.type}</p>
    </div>
  </article>
);
