class ParticipantsController < ApplicationController
  def fetch
    params[:participant_id] == "all" ? @participant_by_query = Participant.all : @participant_by_query = Participant.where("id = " + params[:participant_id])
    render json: @participant_by_query, root: false
    # find JSON definition in the serializer
    # prepare for multiple projects
  end
end
