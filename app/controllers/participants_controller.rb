class ParticipantsController < ApplicationController
  def fetch
    params[:participant_id] == "all" ? @participant_by_query = Participant.all : @participant_by_query = Participant.where("id = " + params[:participant_id])
    render json: @participant_by_query, root: false
    # find JSON definition in the serializer
    # prepare for multiple projects
  end
  
  def index
    @participants = Participant.all
    render json: @participants, root: false
  end
  
  def show
    @participant = Participant.find(params[:id])
  end
  
  def create
    Participant.create(participant_params)
  end
  
  def participant_params
    params.require(:participant).permit(:name, :persona_id)
  end
  
end
